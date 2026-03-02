# Salesforce Setup Guide

## 1. Custom Objects

### Deposit_Product__c

| Field API Name         | Type              | Notes                                              |
| ---------------------- | ----------------- | -------------------------------------------------- |
| Name                   | Text (standard)   | Product display name                                |
| Type__c                | Picklist           | Values: checking, savings, money_market, cd         |
| Description__c         | Long Text Area     | Product description                                 |
| Interest_Rate__c       | Number(5,2)        | APY percentage                                      |
| Min_Opening_Deposit__c | Currency           | Minimum deposit to open                             |
| Features__c            | Long Text Area     | Newline-separated list of features                  |
| Term_Months__c         | Number             | CD term length in months (blank for non-CD)         |
| Active__c              | Checkbox           | Whether the product is available for applications   |

### Disclosure__c

| Field API Name  | Type              | Notes                                              |
| --------------- | ----------------- | -------------------------------------------------- |
| Title__c        | Text              | Disclosure title                                    |
| Description__c  | Long Text Area     | Summary of the disclosure                           |
| PDF_URL__c      | URL                | Link to the PDF document (S3, etc.)                 |
| Required__c     | Checkbox           | Must be acknowledged before proceeding              |
| Sort_Order__c   | Number             | Display order                                       |
| Scope__c        | Picklist           | Values: product, bank                               |
| Product__c      | Lookup(Deposit_Product__c) | Associated product (null for bank-wide)      |

### Account_Application__c

| Field API Name                    | Type              | Notes                                    |
| --------------------------------- | ----------------- | ---------------------------------------- |
| Status__c                         | Picklist           | started, personal_info_completed, kyc_completed, kyc_failed, disclosures_attested, funding_completed, submitted, approved, rejected |
| Selected_Product__c               | Lookup(Deposit_Product__c) | Chosen deposit product           |
| First_Name__c                     | Text               | Applicant first name                     |
| Last_Name__c                      | Text               | Applicant last name                      |
| Email__c                          | Email              | Applicant email                          |
| Phone__c                          | Phone              | Applicant phone                          |
| Date_of_Birth__c                  | Date               | Applicant DOB                            |
| SSN__c                            | Text (Encrypted)   | Social Security Number                   |
| Street__c                         | Text               | Street address                           |
| Unit__c                           | Text               | Apartment/Unit (optional)                |
| City__c                           | Text               | City                                     |
| State__c                          | Text               | State code                               |
| Zip_Code__c                       | Text               | ZIP code                                 |
| KYC_Status__c                     | Picklist           | pending, passed, failed, review          |
| KYC_Verification_Id__c            | Text               | External KYC verification ID             |
| Disclosure_Attestations_JSON__c   | Long Text Area     | JSON array of attestation records         |
| Funding_Status__c                 | Picklist           | pending, authorized, completed, failed, skipped |
| Funding_Transfer_Id__c            | Text               | External funding transfer ID             |
| Funding_Amount__c                 | Currency           | Initial funding amount                   |
| Linked_Account_Mask__c            | Text               | Last 4 digits of linked account          |
| Linked_Institution_Name__c        | Text               | Bank name of linked account              |
| Submitted_At__c                   | DateTime           | When the application was submitted       |

## 2. Connected App Setup (OAuth 2.0 Web Server Flow)

1. **Create a Connected App** in Salesforce Setup:
   - Setup > App Manager > New Connected App
   - Enable OAuth Settings
   - Callback URL: `http://localhost:3000/api/salesforce/oauth/callback` (dev)
     - Add your production URL too: `https://yourdomain.com/api/salesforce/oauth/callback`
   - Selected OAuth Scopes: `api`, `refresh_token`
   - Check "Require Secret for Web Server Flow"

2. **Get your credentials** from the Connected App detail page:
   - Consumer Key (= `SALESFORCE_CLIENT_ID`)
   - Consumer Secret (= `SALESFORCE_CLIENT_SECRET`)

3. **Set Environment Variables** in `.env.local`:
   ```env
   SALESFORCE_INSTANCE_URL=https://yourorg.my.salesforce.com
   SALESFORCE_CLIENT_ID=<Connected App Consumer Key>
   SALESFORCE_CLIENT_SECRET=<Connected App Consumer Secret>
   ```

4. **Authorize the app:**
   - Visit `http://localhost:3000/api/salesforce/oauth/login`
   - Log in to Salesforce and grant access
   - You'll be redirected back to your app with tokens stored server-side

## 3. Deploy the Apex Class

Using Salesforce CLI:
```bash
sf project deploy start --source-dir salesforce/classes --target-org your-org-alias
```

Or manually:
1. Setup > Apex Classes > New
2. Paste the contents of `DepositAccountAPI.cls`
3. Save

## 4. Verify

Test the endpoint with curl:
```bash
curl https://yourorg.my.salesforce.com/services/apexrest/dao/v1/products \
  -H "Authorization: Bearer <access_token>"
```

## 5. Where to See Records

- **Products:** Setup > Object Manager > Deposit Product > Tab (or create a List View)
- **Disclosures:** Setup > Object Manager > Disclosure > Tab
- **Applications:** Setup > Object Manager > Account Application > Tab
  - You can also build a Salesforce Report on Account_Application__c to see all submissions
  - Or create a Lightning App Page / Dashboard for a visual overview
