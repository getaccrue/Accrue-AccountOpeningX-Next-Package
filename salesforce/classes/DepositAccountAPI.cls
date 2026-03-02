/**
 * DepositAccountAPI
 *
 * Apex REST resource that exposes deposit-account-opening endpoints.
 * Base URL: /services/apexrest/dao/v1
 *
 * Endpoints handled:
 *   GET    /products                          -> list active deposit products
 *   GET    /products/{productId}/disclosures  -> list disclosures for a product
 *   GET    /config                            -> bank configuration
 *   POST   /applications                      -> create a new application
 *   PATCH  /applications/{id}                 -> update application with applicant data
 *   POST   /applications/{id}/submit          -> mark application as submitted
 *
 * Deploy to your Salesforce org alongside the companion metadata:
 *   - DepositAccountAPI.cls-meta.xml
 *   - Custom objects: Deposit_Product__c, Disclosure__c, Account_Application__c
 */
@RestResource(urlMapping='/dao/v1/*')
global with sharing class DepositAccountAPI {

    // ─── Routing ───────────────────────────────────────────────────────

    @HttpGet
    global static void doGet() {
        RestRequest  req = RestContext.request;
        RestResponse res = RestContext.response;
        String path = req.requestURI.substringAfter('/dao/v1');

        try {
            if (path == '/config') {
                res.responseBody = Blob.valueOf(JSON.serialize(getConfig()));
            } else if (path == '/products') {
                res.responseBody = Blob.valueOf(JSON.serialize(getProducts()));
            } else if (path.startsWith('/products/') && path.endsWith('/disclosures')) {
                String productId = path.substringBetween('/products/', '/disclosures');
                res.responseBody = Blob.valueOf(JSON.serialize(getDisclosures(productId)));
            } else {
                res.statusCode = 404;
                res.responseBody = Blob.valueOf('{"error":"Not found"}');
            }
        } catch (Exception e) {
            res.statusCode = 500;
            res.responseBody = Blob.valueOf(JSON.serialize(new Map<String, String>{
                'error' => e.getMessage()
            }));
        }

        res.addHeader('Content-Type', 'application/json');
    }

    @HttpPost
    global static void doPost() {
        RestRequest  req = RestContext.request;
        RestResponse res = RestContext.response;
        String path = req.requestURI.substringAfter('/dao/v1');

        try {
            if (path == '/applications') {
                Map<String, Object> body = (Map<String, Object>) JSON.deserializeUntyped(req.requestBody.toString());
                res.statusCode = 201;
                res.responseBody = Blob.valueOf(JSON.serialize(createApplication(body)));
            } else if (path.endsWith('/submit')) {
                String appId = path.substringBetween('/applications/', '/submit');
                res.statusCode = 200;
                res.responseBody = Blob.valueOf(JSON.serialize(submitApplication(appId)));
            } else {
                res.statusCode = 404;
                res.responseBody = Blob.valueOf('{"error":"Not found"}');
            }
        } catch (Exception e) {
            res.statusCode = 500;
            res.responseBody = Blob.valueOf(JSON.serialize(new Map<String, String>{
                'error' => e.getMessage()
            }));
        }

        res.addHeader('Content-Type', 'application/json');
    }

    @HttpPatch
    global static void doPatch() {
        RestRequest  req = RestContext.request;
        RestResponse res = RestContext.response;
        String path = req.requestURI.substringAfter('/dao/v1');

        try {
            if (path.startsWith('/applications/')) {
                String appId = path.substringAfter('/applications/');
                Map<String, Object> body = (Map<String, Object>) JSON.deserializeUntyped(req.requestBody.toString());
                res.responseBody = Blob.valueOf(JSON.serialize(updateApplication(appId, body)));
            } else {
                res.statusCode = 404;
                res.responseBody = Blob.valueOf('{"error":"Not found"}');
            }
        } catch (Exception e) {
            res.statusCode = 500;
            res.responseBody = Blob.valueOf(JSON.serialize(new Map<String, String>{
                'error' => e.getMessage()
            }));
        }

        res.addHeader('Content-Type', 'application/json');
    }

    // ─── Config ────────────────────────────────────────────────────────

    private static Map<String, Object> getConfig() {
        // Pull from a Custom Metadata Type or Custom Setting in production.
        // Example uses hardcoded values matching the expected BankConfig shape.
        return new Map<String, Object>{
            'bankName'       => 'First National Bank',
            'logoUrl'        => '',
            'primaryColor'   => '#0F4C81',
            'secondaryColor' => '#1A1A2E',
            'accentColor'    => '#10B981',
            'kycConfig'      => new Map<String, Object>{
                'idvTemplateName' => 'default_template',
                'requiredSteps'   => new List<String>{
                    'accept_tos', 'verify_sms', 'kyc_check',
                    'documentary_verification', 'selfie_check'
                }
            }
        };
    }

    // ─── Products ──────────────────────────────────────────────────────

    private static List<Map<String, Object>> getProducts() {
        List<Deposit_Product__c> products = [
            SELECT Id, Name, Type__c, Description__c, Interest_Rate__c,
                   Min_Opening_Deposit__c, Features__c, Term_Months__c, Active__c
            FROM Deposit_Product__c
            WHERE Active__c = true
            ORDER BY Name ASC
        ];

        List<Map<String, Object>> result = new List<Map<String, Object>>();
        for (Deposit_Product__c p : products) {
            Map<String, Object> item = new Map<String, Object>{
                'id'                => p.Id,
                'name'              => p.Name,
                'type'              => p.Type__c,
                'description'       => p.Description__c,
                'interestRate'      => p.Interest_Rate__c,
                'minOpeningDeposit' => p.Min_Opening_Deposit__c,
                'features'          => p.Features__c != null ? p.Features__c.split('\n') : new List<String>(),
                'termMonths'        => p.Term_Months__c,
                'active'            => p.Active__c
            };
            result.add(item);
        }
        return result;
    }

    // ─── Disclosures ───────────────────────────────────────────────────

    private static List<Map<String, Object>> getDisclosures(String productId) {
        // Fetch both product-scoped and bank-wide disclosures
        List<Disclosure__c> disclosures = [
            SELECT Id, Title__c, Description__c, PDF_URL__c,
                   Required__c, Sort_Order__c, Scope__c
            FROM Disclosure__c
            WHERE (Product__c = :productId OR Scope__c = 'bank')
            ORDER BY Sort_Order__c ASC
        ];

        List<Map<String, Object>> result = new List<Map<String, Object>>();
        for (Disclosure__c d : disclosures) {
            result.add(new Map<String, Object>{
                'id'          => d.Id,
                'title'       => d.Title__c,
                'description' => d.Description__c,
                'pdfUrl'      => d.PDF_URL__c,
                'required'    => d.Required__c,
                'sortOrder'   => d.Sort_Order__c,
                'scope'       => d.Scope__c
            });
        }
        return result;
    }

    // ─── Applications ──────────────────────────────────────────────────

    private static Map<String, Object> createApplication(Map<String, Object> body) {
        Account_Application__c app = new Account_Application__c(
            Status__c             = 'started',
            Selected_Product__c   = (String) body.get('selectedProductId')
        );
        insert app;
        return serializeApplication(app.Id);
    }

    private static Map<String, Object> updateApplication(String appId, Map<String, Object> body) {
        Account_Application__c app = [
            SELECT Id FROM Account_Application__c WHERE Id = :appId LIMIT 1
        ];

        // Personal Info
        if (body.containsKey('personalInfo')) {
            Map<String, Object> pi = (Map<String, Object>) body.get('personalInfo');
            app.First_Name__c     = (String) pi.get('firstName');
            app.Last_Name__c      = (String) pi.get('lastName');
            app.Email__c          = (String) pi.get('email');
            app.Phone__c          = (String) pi.get('phone');
            app.Date_of_Birth__c  = Date.valueOf((String) pi.get('dateOfBirth'));
            app.SSN__c            = (String) pi.get('ssn');

            if (pi.containsKey('address')) {
                Map<String, Object> addr = (Map<String, Object>) pi.get('address');
                app.Street__c   = (String) addr.get('street');
                app.Unit__c     = (String) addr.get('unit');
                app.City__c     = (String) addr.get('city');
                app.State__c    = (String) addr.get('state');
                app.Zip_Code__c = (String) addr.get('zipCode');
            }
            app.Status__c = 'personal_info_completed';
        }

        // KYC
        if (body.containsKey('kycStatus')) {
            app.KYC_Status__c          = (String) body.get('kycStatus');
            app.KYC_Verification_Id__c = (String) body.get('kycVerificationId');
            app.Status__c = (String) body.get('kycStatus') == 'passed'
                ? 'kyc_completed' : 'kyc_failed';
        }

        // Disclosures
        if (body.containsKey('disclosureAttestations')) {
            app.Disclosure_Attestations_JSON__c = JSON.serialize(body.get('disclosureAttestations'));
            app.Status__c = 'disclosures_attested';
        }

        // Funding
        if (body.containsKey('fundingStatus')) {
            app.Funding_Status__c           = (String) body.get('fundingStatus');
            app.Funding_Transfer_Id__c      = (String) body.get('fundingTransferId');
            app.Funding_Amount__c           = body.get('fundingAmount') != null
                ? Decimal.valueOf(String.valueOf(body.get('fundingAmount'))) : null;
            app.Linked_Account_Mask__c      = (String) body.get('linkedAccountMask');
            app.Linked_Institution_Name__c  = (String) body.get('linkedInstitutionName');
            app.Status__c = 'funding_completed';
        }

        update app;
        return serializeApplication(app.Id);
    }

    private static Map<String, Object> submitApplication(String appId) {
        Account_Application__c app = [
            SELECT Id FROM Account_Application__c WHERE Id = :appId LIMIT 1
        ];
        app.Status__c = 'submitted';
        app.Submitted_At__c = Datetime.now();
        update app;
        return serializeApplication(app.Id);
    }

    // ─── Serializer ────────────────────────────────────────────────────

    private static Map<String, Object> serializeApplication(Id appId) {
        Account_Application__c app = [
            SELECT Id, Status__c, Selected_Product__c,
                   First_Name__c, Last_Name__c, Email__c, Phone__c,
                   Date_of_Birth__c, SSN__c,
                   Street__c, Unit__c, City__c, State__c, Zip_Code__c,
                   KYC_Status__c, KYC_Verification_Id__c,
                   Disclosure_Attestations_JSON__c,
                   Funding_Status__c, Funding_Transfer_Id__c, Funding_Amount__c,
                   Linked_Account_Mask__c, Linked_Institution_Name__c,
                   CreatedDate, LastModifiedDate
            FROM Account_Application__c
            WHERE Id = :appId
            LIMIT 1
        ];

        Map<String, Object> result = new Map<String, Object>{
            'id'                   => app.Id,
            'status'               => app.Status__c,
            'selectedProductId'    => app.Selected_Product__c,
            'kycStatus'            => app.KYC_Status__c,
            'kycVerificationId'    => app.KYC_Verification_Id__c,
            'fundingStatus'        => app.Funding_Status__c,
            'fundingTransferId'    => app.Funding_Transfer_Id__c,
            'fundingAmount'        => app.Funding_Amount__c,
            'linkedAccountMask'    => app.Linked_Account_Mask__c,
            'linkedInstitutionName'=> app.Linked_Institution_Name__c,
            'createdAt'            => app.CreatedDate.formatGMT('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
            'updatedAt'            => app.LastModifiedDate.formatGMT('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'')
        };

        // Build personalInfo sub-object
        if (app.First_Name__c != null) {
            Map<String, Object> personalInfo = new Map<String, Object>{
                'firstName'   => app.First_Name__c,
                'lastName'    => app.Last_Name__c,
                'email'       => app.Email__c,
                'phone'       => app.Phone__c,
                'dateOfBirth' => app.Date_of_Birth__c != null
                    ? String.valueOf(app.Date_of_Birth__c) : null,
                'ssn'         => maskSSN(app.SSN__c),
                'address'     => new Map<String, Object>{
                    'street'  => app.Street__c,
                    'unit'    => app.Unit__c,
                    'city'    => app.City__c,
                    'state'   => app.State__c,
                    'zipCode' => app.Zip_Code__c
                }
            };
            result.put('personalInfo', personalInfo);
        }

        // Build disclosureAttestations from stored JSON
        if (app.Disclosure_Attestations_JSON__c != null) {
            result.put('disclosureAttestations',
                JSON.deserializeUntyped(app.Disclosure_Attestations_JSON__c));
        }

        return result;
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private static String maskSSN(String ssn) {
        if (ssn == null || ssn.length() < 4) return '***-**-****';
        return '***-**-' + ssn.right(4);
    }
}
