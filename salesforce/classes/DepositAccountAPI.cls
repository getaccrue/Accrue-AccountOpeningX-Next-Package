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
@RestResource(urlMapping='/accrue/dao/v1/*')
global with sharing class DepositAccountAPI {

    // ─── Routing ───────────────────────────────────────────────────────

    @HttpGet
    global static void doGet() {
        RestRequest  req = RestContext.request;
        RestResponse res = RestContext.response;
        String path = req.requestURI.substringAfter('/dao/v1');

        if (path == '/ping') {
            res.responseBody = Blob.valueOf('{"ok":true}');
            res.addHeader('Content-Type', 'application/json');
            return;
        }

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
            } else if (path.endsWith('/requested-documents')) {
                String appId = path.substringBetween('/applications/', '/requested-documents');
                Map<String, Object> body = String.isBlank(req.requestBody.toString())
                    ? new Map<String, Object>()
                    : (Map<String, Object>) JSON.deserializeUntyped(req.requestBody.toString());
                res.statusCode = 201;
                res.responseBody = Blob.valueOf(JSON.serialize(createRequestedDocuments(appId, body)));
            } else if (path.endsWith('/submit')) {
                String appId = path.substringBetween('/applications/', '/submit');
                system.debug(appId);
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
            'bankName'       => 'Accrue Bank',
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
        List<accrue__Bank_Product__c> products = [
            SELECT Id, Name, accrue__Product_Type__c, accrue__Product_Description__c, Interest_Rate__c,
            accrue__Account_Opening_Minimum_Balance__c, Features__c, Term_Months__c
            FROM accrue__Bank_Product__c WHERE accrue__Product_Type__c ='11' OR accrue__Product_Type__c ='1'
            ORDER BY Name ASC
        ];

        List<Map<String, Object>> result = new List<Map<String, Object>>();
        Map<String, String> productTypeMap = new Map<String, String>{
            '1'  => 'savings',
                '4'  => 'money_market',
                '11' => 'checking'
                };
                    for (accrue__Bank_Product__c p : products) {
                        Map<String, Object> item = new Map<String, Object>{
                            'id'                => p.Id,
                                'name'              => p.Name,
                                'type' 				=> productTypeMap.get(p.accrue__Product_Type__c),
                                'description'       => p.accrue__Product_Description__c,
                                'interestRate'      => p.Interest_Rate__c,
                                'minOpeningDeposit' => p.accrue__Account_Opening_Minimum_Balance__c,
                                'features'          => p.Features__c != null ? p.Features__c.split('\n') : new List<String>(),
                                    'termMonths'        => p.Term_Months__c
                                    };
                                        result.add(item);
                    }
        system.debug(result);
        return result;
    }

    // ─── Disclosures ───────────────────────────────────────────────────

    private static List<Map<String, Object>> getDisclosures(String productId) {
        List<accrue__Bank_Product__c> selectedProducts = [
            SELECT Id, Name
            FROM accrue__Bank_Product__c
            WHERE Id = :productId
            LIMIT 1
        ];

        if (selectedProducts.isEmpty()) {
            return new List<Map<String, Object>>();
        }

        Id selectedProductId = selectedProducts[0].Id;
        String productName = selectedProducts[0].Name;
        String productNameLower = productName == null ? '' : productName.toLowerCase();

        List<accrue__Related_Disclosure__c> relatedDisclosures = [
            SELECT accrue__Bank_Product__c, accrue__Disclosure__c
            FROM accrue__Related_Disclosure__c
            WHERE accrue__Disclosure__c != null
              AND accrue__Bank_Product__c != null
        ];

        Set<Id> relatedProductIds = new Set<Id>();
        for (accrue__Related_Disclosure__c relatedDisclosure : relatedDisclosures) {
            relatedProductIds.add(relatedDisclosure.accrue__Bank_Product__c);
        }

        if (relatedProductIds.isEmpty()) {
            return new List<Map<String, Object>>();
        }

        Map<Id, accrue__Bank_Product__c> relatedProducts = new Map<Id, accrue__Bank_Product__c>(
            [
                SELECT Id, Name
                FROM accrue__Bank_Product__c
                WHERE Id IN :relatedProductIds
            ]
        );

        Set<Id> disclosureIds = new Set<Id>();
        for (accrue__Related_Disclosure__c relatedDisclosure : relatedDisclosures) {
            Id relatedProductId = relatedDisclosure.accrue__Bank_Product__c;
            accrue__Bank_Product__c relatedProduct = relatedProducts.get(relatedProductId);
            String relatedProductName = relatedProduct == null ? null : relatedProduct.Name;
            String relatedProductNameLower = relatedProductName == null
                ? ''
                : relatedProductName.toLowerCase();

            if (
                relatedProductId == selectedProductId ||
                (
                    productNameLower != '' &&
                    relatedProductNameLower != '' &&
                    relatedProductNameLower.contains(productNameLower)
                )
            ) {
                disclosureIds.add(relatedDisclosure.accrue__Disclosure__c);
            }
        }

        if (disclosureIds.isEmpty()) {
            return new List<Map<String, Object>>();
        }

        List<accrue__Disclosure__c> disclosures = [
            SELECT Id, Name, accrue__Text__c, accrue__URL__c
            FROM accrue__Disclosure__c
            WHERE Id IN :disclosureIds
            ORDER BY Name ASC
        ];

        List<Map<String, Object>> result = new List<Map<String, Object>>();
        Integer sortOrder = 1;
        for (accrue__Disclosure__c d : disclosures) {
            result.add(new Map<String, Object>{
                'id'          => d.Id,
                    'title'       => d.Name,
                    'description' => d.accrue__Text__c,
                    'pdfUrl'      => d.accrue__URL__c,
                    'required'    => true,
                    'sortOrder'   => sortOrder,
                    'scope'       => 'product'
                    });
            sortOrder++;
        }
        return result;
    }

    // ─── Applications ──────────────────────────────────────────────────

    private static Map<String, Object> createApplication(Map<String, Object> body) {

        accrue__Branch__c branch = [
            SELECT Id, Name
            FROM accrue__Branch__c
            WHERE Name = 'Online Application'
            LIMIT 1
        ];
        accrue__Account_Opening__c app = new accrue__Account_Opening__c(
            accrue__Status__c             = 'Active',
            accrue__Bank_Product__c   = (String) body.get('selectedProductId'),
            accrue__Opening_Started_Date__c = Date.today(),
            accrue__Stage__c = 'Review',
            accrue__Branch__c = branch.Id,
            accrue__Application_Stage__c = 'Review',
            accrue__CoreAccountId__c = generateCoreAccountId()
        );
        insert app;
        system.debug('@@1 '+ app);
        return serializeApplication(app.Id);
    }

    private static Map<String, Object> createRequestedDocuments(
        String appId,
        Map<String, Object> body
    ) {
        Id accountOpeningId = (Id) appId;
        List<Object> uploads = new List<Object>();
        if (body.containsKey('requestedDocumentUploads') && body.get('requestedDocumentUploads') != null) {
            uploads = (List<Object>) body.get('requestedDocumentUploads');
        } else if (body.containsKey('requestedDocumentUpload') && body.get('requestedDocumentUpload') != null) {
            uploads.add(body.get('requestedDocumentUpload'));
        }

        if (uploads.isEmpty()) {
            throw new AuraHandledException('requestedDocumentUploads is required.');
        }

        List<String> ids = new List<String>();
        List<String> fileErrors = new List<String>();
        for (Object uploadObject : uploads) {
            Map<String, Object> upload = (Map<String, Object>) uploadObject;
            String documentName =
                upload.containsKey('documentName') && upload.get('documentName') != null
                    ? String.valueOf(upload.get('documentName'))
                    : 'Driver License';

            List<accrue__Requested_Documents__c> existingDocuments = [
                SELECT Id
                FROM accrue__Requested_Documents__c
                WHERE accrue__Account_Opening__c = :accountOpeningId
                  AND Name = :documentName
                LIMIT 1
            ];

            accrue__Requested_Documents__c requestedDocument;
            if (existingDocuments.isEmpty()) {
                requestedDocument = new accrue__Requested_Documents__c();
                requestedDocument.Name = documentName;
                requestedDocument.accrue__Account_Opening__c = accountOpeningId;
                requestedDocument.accrue__Assigned_Role__c = 'Doc Prep';
                requestedDocument.accrue__Status__c = 'Requested';
                requestedDocument.accrue__Requested_Due_Date__c = Date.today().addDays(5);
                insert requestedDocument;
            } else {
                requestedDocument = existingDocuments[0];
            }

            if (
                upload.containsKey('base64') &&
                upload.get('base64') != null &&
                String.valueOf(upload.get('base64')) != ''
            ) {
                String fallbackFileName =
                    documentName.toLowerCase().replaceAll('[^a-z0-9]+', '-') + '.pdf';
                String fileName =
                    upload.containsKey('fileName') && upload.get('fileName') != null
                        ? String.valueOf(upload.get('fileName'))
                        : fallbackFileName;

                try {
                    ContentVersion fileVersion = new ContentVersion(
                        Title = documentName,
                        PathOnClient = fileName,
                        VersionData = EncodingUtil.base64Decode(String.valueOf(upload.get('base64'))),
                        FirstPublishLocationId = requestedDocument.Id
                    );
                    insert fileVersion;
                } catch (Exception fileException) {
                    fileErrors.add(documentName + ': ' + fileException.getMessage());
                }
            }

            ids.add((String) requestedDocument.Id);
        }

        return new Map<String, Object>{
            'ids' => ids,
            'fileErrors' => fileErrors
        };
    }

    private static Map<String, Object> updateApplication(String appId, Map<String, Object> body) {
        accrue__Account_Opening__c app = [
            SELECT Id FROM accrue__Account_Opening__c WHERE Id = :appId LIMIT 1
        ];
        Account acc  = new Account();

        // Personal Info
        if (body.containsKey('personalInfo')) {
            Map<String, Object> pi = (Map<String, Object>) body.get('personalInfo');
            acc.FirstName     = (String) pi.get('firstName');
            acc.LastName      = (String) pi.get('lastName');
            acc.PersonEmail          = (String) pi.get('email');
            acc.Phone          = (String) pi.get('phone');
            acc.PersonBirthdate  = Date.valueOf((String) pi.get('dateOfBirth'));
            acc.accrue__TIN__c            = (String) pi.get('ssn');

            if (pi.containsKey('address')) {
                Map<String, Object> addr = (Map<String, Object>) pi.get('address');
                acc.PersonMailingStreet   = (String) addr.get('street');
                //acc.Unit__c     = (String) addr.get('unit');
                acc.PersonMailingCity     = (String) addr.get('city');
                acc.PersonMailingState    = (String) addr.get('state');
                acc.PersonMailingPostalCode = (String) addr.get('zipCode');
            }
            //app.Status__c = 'personal_info_completed';
        }

        /*// KYC
if (body.containsKey('kycStatus')) {
app.KYC_Status__c          = (String) body.get('kycStatus');
app.KYC_Verification_Id__c = (String) body.get('kycVerificationId');
app.Status__c = (String) body.get('kycStatus') == 'passed'
? 'kyc_completed' : 'kyc_failed';
}*/

        // Disclosures
        /*if (body.containsKey('disclosureAttestations')) {
app.Disclosure_Attestations_JSON__c = JSON.serialize(body.get('disclosureAttestations'));
app.Status__c = 'disclosures_attested';
}*/

        /*// Funding
if (body.containsKey('fundingStatus')) {
app.Funding_Status__c           = (String) body.get('fundingStatus');
app.Funding_Transfer_Id__c      = (String) body.get('fundingTransferId');
app.Funding_Amount__c           = body.get('fundingAmount') != null
? Decimal.valueOf(String.valueOf(body.get('fundingAmount'))) : null;
app.Linked_Account_Mask__c      = (String) body.get('linkedAccountMask');
app.Linked_Institution_Name__c  = (String) body.get('linkedInstitutionName');
app.Status__c = 'funding_completed';
}*/
        system.debug('@@2 '+ app);
        system.debug('@@1 '+ acc);
        insert acc;
        app.accrue__Person_Applicant_Relationship__c = acc.Id;
        update app;

        system.debug('@@1 '+ app);
        return serializeApplication(app.Id);
    }

    private static Map<String, Object> submitApplication(String appId) {

        accrue__Account_Opening__c app = [
            SELECT Id FROM accrue__Account_Opening__c WHERE Id = :appId LIMIT 1
        ];
        app.accrue__Status__c = 'Submitted';
        //app.Submitted_At__c = Datetime.now();
        update app;
        System.debug('submitApplication updated status=' + app.accrue__Status__c);
        return serializeApplication(app.Id);
    }

    // ─── Serializer ────────────────────────────────────────────────────

    private static Map<String, Object> serializeApplication(Id appId) {
        accrue__Account_Opening__c app = [
            SELECT Id, accrue__Status__c,accrue__CoreAccountId__c, /*Selected_Product__c,
First_Name__c, Last_Name__c, Email__c, Phone__c,
Date_of_Birth__c, SSN__c,
Street__c, Unit__c, City__c, State__c, Zip_Code__c,
KYC_Status__c, KYC_Verification_Id__c,
Disclosure_Attestations_JSON__c,
Funding_Status__c, Funding_Transfer_Id__c, Funding_Amount__c,
Linked_Account_Mask__c, Linked_Institution_Name__c,*/
            CreatedDate, LastModifiedDate
            FROM accrue__Account_Opening__c
            WHERE Id = :appId
            LIMIT 1
        ];
        Map<String, Object> result = new Map<String, Object>{
            'id'                   => app.Id,
                'status'               => app.accrue__Status__c,
                'accountnumber'        => app.accrue__CoreAccountId__c,
                /*'selectedProductId'    => app.Selected_Product__c,
'kycStatus'            => app.KYC_Status__c,
'kycVerificationId'    => app.KYC_Verification_Id__c,
'fundingStatus'        => app.Funding_Status__c,
'fundingTransferId'    => app.Funding_Transfer_Id__c,
'fundingAmount'        => app.Funding_Amount__c,
'linkedAccountMask'    => app.Linked_Account_Mask__c,
'linkedInstitutionName'=> app.Linked_Institution_Name__c,*/
                'createdAt'            => app.CreatedDate.formatGMT('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\''),
                'updatedAt'            => app.LastModifiedDate.formatGMT('yyyy-MM-dd\'T\'HH:mm:ss.SSS\'Z\'')
                };

                    // Build personalInfo sub-object
                    /*if (app.First_Name__c != null) {
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
}*/

                    // Build disclosureAttestations from stored JSON
                    /*if (app.Disclosure_Attestations_JSON__c != null) {
result.put('disclosureAttestations',
JSON.deserializeUntyped(app.Disclosure_Attestations_JSON__c));
}*/

                    return result;
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private static String firstExistingObject(
        Map<String, Schema.SObjectType> objectTypes,
        List<String> candidates
    ) {
        for (String candidate : candidates) {
            if (objectTypes.containsKey(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private static String firstExistingField(
        Map<String, Schema.SObjectField> fields,
        List<String> candidates
    ) {
        for (String candidate : candidates) {
            if (fields.containsKey(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private static String getReferenceObjectName(Schema.SObjectField fieldToken) {
        if (fieldToken == null) {
            return null;
        }

        List<Schema.SObjectType> referenceTypes =
            fieldToken.getDescribe().getReferenceTo();
        if (referenceTypes.isEmpty()) {
            return null;
        }

        return referenceTypes[0].getDescribe().getName();
    }

    private static String maskSSN(String ssn) {
        if (ssn == null || ssn.length() < 4) return '***-**-****';
        return '***-**-' + ssn.right(4);
    }
    private static String generateCoreAccountId() {
    // Get the latest numeric core account id (ignore blanks/non-numeric)
    List<accrue__Account_Opening__c> rows = [
        SELECT accrue__CoreAccountId__c
        FROM accrue__Account_Opening__c
        WHERE accrue__CoreAccountId__c != null
        ORDER BY CreatedDate DESC
        LIMIT 50
    ];

    Long lastNum = 0;
    for (accrue__Account_Opening__c r : rows) {
        String v = r.accrue__CoreAccountId__c;
        if (String.isBlank(v)) continue;

        // keep only digits
        String digits = v.replaceAll('[^0-9]', '');
        if (String.isBlank(digits)) continue;

        try {
            lastNum = Long.valueOf(digits);
            break; // first valid numeric found
        } catch (Exception e) {
            // keep scanning
        }
    }

    Long nextNum = lastNum + 1;

    // 9-digit, zero-padded: 000000001
    return String.valueOf(nextNum).leftPad(9, '0');
}
}
