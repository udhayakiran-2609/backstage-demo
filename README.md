# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
yarn install
yarn start
```

<!-- Authentication -->

Authentication

- Created a Okta admin account
- Generated OAuth token for testing purpose
- Configured a auth in app-config.yaml file
- Created a custom resolver for okta (Can put the condition like only the organization users can login)

Keys Needed

 - AUTH_OKTA_CLIENT_ID
 - AUTH_OKTA_CLIENT_SECRET
 - AUTH_OKTA_DOMAIN

Setup - https://backstage.io/docs/auth/okta/provider

They has three resolver in built

1. emailMatchingUserEntityProfileEmail
    
    - It will search from the catalog-info.yaml file from this location spec.profile.email, if the login email has entry in this then can login.
   
2. emailLocalPartMatchingUserEntityName

   - Takes the part before @ and matches the name from cataog-info.yaml file from this location metadata.name

3. emailMatchingUserEntityAnnotation

   - Matches the email against a catalog annotation from catalog-ingo.yaml file from the location metadata.annotations["okta.com/email"]


<!-- Software template flow -->

Backstage Software Templates allow developers to create new services (Node.js, Python, etc.) in a standardized way. A single template execution can:

Generate a service from a skeleton
Create a new GitHub repository
Configure CI/CD pipelines
Register the service in Backstage Catalog
🔁 High-Level Flow
Developer selects template in Backstage UI
        ↓
Fills in service details (name, description, etc.)
        ↓
Backstage Scaffolder engine runs template steps
        ↓
Skeleton code is generated from template
        ↓
New GitHub repository is created
        ↓
Code is pushed automatically
        ↓
CI/CD pipeline is configured (GitHub Actions, etc.)
        ↓
Component is registered in Backstage Catalog
        ↓
Service becomes visible in Developer Portal
⚙️ Step-by-Step Execution Flow
1. Template Selection
Developer opens Backstage UI
Navigates to Create → Software Template
Selects a template (e.g., Node.js Service)
2. Input Collection

The template collects parameters such as:

Service name
Description
Owner/team
Repository name
3. Template Processing (Scaffolder Engine)

Backstage executes defined steps in template.yaml:

Typical steps include:

fetch:template → Load skeleton code
publish:github → Create repository
catalog:register → Register service in catalog
4. Skeleton Generation
Template files are copied from /skeleton
Variables are replaced dynamically
Final project structure is generated

Example:

service-name/
 ├── src/
 ├── Dockerfile
 ├── package.json
 ├── catalog-info.yaml
 └── .github/workflows/ci.yml
5. GitHub Repository Creation

Backstage automatically:

Creates a new repository under the configured GitHub org
Pushes generated code
Initializes default branch (main)
6. CI/CD Setup

A default pipeline is added (example: GitHub Actions):

Install dependencies
Run tests
Build application
(Optional) Deploy to environment
7. Catalog Registration

A catalog-info.yaml file is used to register the service:

apiVersion: backstage.io/v1alpha1
kind: Component

metadata:
  name: service-name
  description: Service description

spec:
  type: service
  owner: platform-team
  lifecycle: production

Backstage automatically imports it into the Software Catalog.

8. Final Output

After execution:

GitHub repository is ready
CI/CD pipeline is active
Service appears in Backstage Catalog
Developers can start coding immediately
🧭 Architecture Summary
Backstage UI
     ↓
Scaffolder Plugin
     ↓
Template (template.yaml)
     ↓
Skeleton Repository
     ↓
GitHub API (repo creation)
     ↓
CI/CD Pipeline (GitHub Actions)
     ↓
Backstage Catalog Registration