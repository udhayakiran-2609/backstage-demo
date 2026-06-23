# [Backstage](https://backstage.io)

This is your newly scaffolded Backstage App, Good Luck!

To start the app, run:

```sh
yarn install
yarn start
```


# Backstage Software Catalog & TechDocs Setup Guide

## Overview

This guide explains how to:

1. Register an Angular application in Backstage
2. Create Teams and Users
3. Connect Frontend and Backend services
4. Add API relationships
5. Add Resources (MongoDB, Kafka, etc.)
6. Configure TechDocs

---

# Prerequisites

Before starting, ensure you have:

* Git installed
* GitHub account
* Backstage running locally
* Node.js installed
* Python installed (required for TechDocs)

---

# Step 1: Create a Git Repository

Create a GitHub repository for your application.

Example:

```text
backstage-angular
```

Push your application code to GitHub.

---

# Step 2: Create catalog-info.yaml

Create a file named:

```text
catalog-info.yaml
```

Place it in the root of the repository.

Example:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: backstage-angular
  description: Angular frontend application
  annotations:
    github.com/project-slug: sairam3333/backstage-angular
    backstage.io/techdocs-ref: dir:.
spec:
  type: website
  lifecycle: production
  owner: elite-frontend-team
```

### Explanation

| Property                | Description                           |
| ----------------------- | ------------------------------------- |
| name                    | Component name shown in Backstage     |
| description             | Description of the application        |
| github.com/project-slug | GitHub repository                     |
| techdocs-ref            | Location of documentation             |
| type                    | website, service, library, etc.       |
| lifecycle               | production, development, experimental |
| owner                   | Team responsible for the component    |

---

# Step 3: Create Team Definition

Create:

```text
group.yaml
```

```yaml
apiVersion: backstage.io/v1alpha1
kind: Group
metadata:
  name: elite-frontend-team
spec:
  type: team
  profile:
    displayName: Elite Frontend Team
  children: []
```

### Purpose

Groups represent teams inside Backstage.

Examples:

* Frontend Team
* Backend Team
* DevOps Team

---

# Step 4: Create User Definition

Create:

```text
user.yaml
```

```yaml
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: guest
  namespace: development
spec:
  profile:
    displayName: Guest User
  memberOf:
    - elite-frontend-team
```

### Purpose

Users can belong to one or more teams.

---

# Step 5: Install Python

TechDocs requires Python and MkDocs.

Download Python:

https://www.python.org/downloads/

During installation select:

```text
✓ Add Python to PATH
```

Verify installation:

```bash
python --version
```

Expected:

```text
Python 3.x.x
```

---

# Step 6: Install MkDocs

Install MkDocs:

```bash
python -m pip install mkdocs
```

Verify:

```bash
mkdocs --version
```

Expected:

```text
mkdocs, version 1.x.x
```

---

# Step 7: Install TechDocs Plugin

Install:

```bash
python -m pip install mkdocs-techdocs-core
```

Verify:

```bash
python -m pip show mkdocs-techdocs-core
```

---

# Step 8: Create mkdocs.yml

Create:

```text
mkdocs.yml
```

in the repository root.

```yaml
site_name: Backstage Angular

nav:
  - Home: index.md

plugins:
  - techdocs-core
```

---

# Step 9: Create Documentation Folder

Create:

```text
docs/
```

Inside docs create:

```text
docs/index.md
```

Example:

```markdown
# Backstage Angular

Angular frontend application.

## Features

- Dashboard
- User Management
- Reports

## Setup

npm install
npm start
```

Repository structure:

```text
backstage-angular
│
├── catalog-info.yaml
├── group.yaml
├── user.yaml
├── mkdocs.yml
├── docs
│   └── index.md
└── src
```

---

# Step 10: Commit and Push

```bash
git add .
git commit -m "Add Backstage catalog metadata"
git push origin main
```

---

# Step 11: Configure GitHub Integration

Create a GitHub Personal Access Token.

GitHub:

https://github.com/settings/tokens

Add token in:

```yaml
integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}
```

Recommended:

```bash
set GITHUB_TOKEN=your_token_here
```

Never commit tokens into Git repositories.

---

# Step 12: Register Team

Backstage:

```text
Create → Register Existing Component
```

Register:

```text
https://github.com/<github-user>/<repo>/blob/main/group.yaml
```

---

# Step 13: Register User

Register:

```text
https://github.com/<github-user>/<repo>/blob/main/user.yaml
```

---

# Step 14: Register Component

Register:

```text
https://github.com/<github-user>/<repo>/blob/main/catalog-info.yaml
```

---

# Step 15: Verify Catalog

Open:

```text
Catalog
```

Verify:

* Component exists
* Team exists
* User exists
* Owner is resolved
* No missing entity warnings

---

# Adding a Backend Service

Create another repository.

Example:

```text
report-card-service
```

Create:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: report-card-service
spec:
  type: service
  lifecycle: production
  owner: elite-frontend-team
```

Register it in Backstage.

---

# Connecting Frontend and Backend

Angular:

```yaml
dependsOn:
  - component:default/report-card-service
```

Result:

```text
Angular Frontend
        ↓
Report Card Service
```

---

# Adding API Documentation

Create:

```text
api-info.yaml
```

```yaml
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: report-api
spec:
  type: openapi
  lifecycle: production
  owner: elite-frontend-team
  definition: |
    openapi: 3.0.0
    info:
      title: Report API
      version: 1.0.0
    paths: {}
```

---

# Connect Components Through APIs

Backend:

```yaml
providesApis:
  - report-api
```

Frontend:

```yaml
consumesApis:
  - report-api
```

Relationship:

```text
Angular Frontend
        ↓
     Report API
        ↓
Spring Boot Backend
```

---

# Adding Resources

## MongoDB

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: report-mongodb
spec:
  type: database
  owner: elite-frontend-team
```

## Kafka

```yaml
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: report-kafka
spec:
  type: messaging
  owner: elite-frontend-team
```

Backend:

```yaml
dependsOn:
  - resource:default/report-mongodb
  - resource:default/report-kafka
```

Relationship:

```text
Angular
   ↓
Spring Boot
   ↓
MongoDB

Spring Boot
   ↓
Kafka
```

---

# TechDocs Verification

Open:

```text
Catalog → backstage-angular → Docs
```

Expected:

* Documentation loads successfully
* Home page displayed
* Markdown rendered correctly

If you get:

```text
spawn mkdocs ENOENT
```

then MkDocs is not available in the PATH used by the Backstage backend process.

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
```
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
```

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

```
Example:

service-name/
 ├── src/
 ├── Dockerfile
 ├── package.json
 ├── catalog-info.yaml
 └── .github/workflows/ci.yml
```

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
```
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
```










# Test
app:
  title: Scaffolded Backstage App
  baseUrl: http://localhost:3000

  # Enable all packages by default, this will discover packages from packages/app/package.json
  packages: all

  extensions:
    - entity-card:catalog-graph/relations
    # - theme:app/light: false
    # - theme:app/dark: false
    # Configure the catalog index page to be the root page, this is normally mounted on /catalog
    - page:catalog:
        config:
          path: /
    - page:tech-radar:
        config:
          path: /tech-radar

organization:
  name: My Company

backend:
  # Used for enabling authentication, secret is shared by all backend plugins
  # See https://backstage.io/docs/auth/service-to-service-auth for
  # information on the format
  # auth:
  #   keys:
  #     - secret: ${BACKEND_SECRET}
  baseUrl: http://localhost:7007
  listen:
    port: 7007
    # Uncomment the following host directive to bind to specific interfaces
    # host: 127.0.0.1
  reading:
    allow:
      - host: raw.githubusercontent.com
      - host: github.com

  csp:
    connect-src: ["'self'", 'http:', 'https:']
    # Content-Security-Policy directives follow the Helmet format: https://helmetjs.github.io/#reference
    # Default Helmet Content-Security-Policy values can be removed by setting the key to false
  cors:
    origin: http://localhost:3000
    methods: [GET, HEAD, PATCH, POST, PUT, DELETE]
    credentials: true
  # This is for local development only, it is not recommended to use this in production
  # The production database configuration is stored in app-config.production.yaml
  database:
    client: better-sqlite3
    connection: ':memory:'
  # see https://backstage.io/docs/ai/mcp-actions#actions-configuration for more details
  actions:
    pluginSources:
      - auth
      - catalog
      - scaffolder
  # workingDirectory: /tmp # Use this to configure a working directory for the scaffolder, defaults to the OS temp-dir

integrations:
  github:
    - host: github.com
      # This is a Personal Access Token or PAT from GitHub. You can find out how to generate this token, and more information
      # about setting up the GitHub integration here: https://backstage.io/docs/integrations/github/locations#configuration
      token: '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'
      webhookSecret: '6d60a096c93c60163d4bd37e09977c7999fbf7914d3ddca94e5d2051558b7e7e'

      # token: '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'
    ### Example for how to add your GitHub Enterprise instance using the API:
    # - host: ghe.example.net
    #   apiBaseUrl: https://ghe.example.net/api/v3
    #   token: ${GHE_TOKEN}

proxy:
  ### Example for how to add a proxy endpoint for the frontend.
  ### A typical reason to do this is to handle HTTPS and CORS for internal services.
  # endpoints:
  #   '/test':
  #     target: 'https://example.com'
  #     changeOrigin: true

# Reference documentation http://backstage.io/docs/features/techdocs/configuration
# Note: After experimenting with basic setup, use CI/CD to generate docs
# and an external cloud storage when deploying TechDocs for production use-case.
# https://backstage.io/docs/features/techdocs/how-to-guides#how-to-migrate-from-techdocs-basic-to-recommended-deployment-approach
techdocs:
  builder: 'local' # Alternatives - 'external'
  generator:
    runIn: local # Alternatives - 'local'
  publisher:
    type: 'local' # Alternatives - 'googleGcs' or 'awsS3'. Read documentation for using alternatives.

auth:
  environment: development
  # see https://backstage.io/docs/auth/ to learn about auth providers
  providers:
    github:
      development:
        clientId: ${AUTH_GITHUB_CLIENT_ID} 
        clientSecret: '${AUTH_GITHUB_CLIENT_SECRET}'
        # clientId: ${AUTH_GITHUB_CLIENT_ID} 
        # clientSecret: ${AUTH_GITHUB_CLIENT_SECRET}
  # see https://backstage.io/docs/ai/mcp-actions#client-id-metadata-documents
  # to learn more about client id metadata documents
    okta:
      development:
        clientId: '0oa13xyyfwp0dahuw698'
        clientSecret: 'xLceEDW6g8yHI7uDFrQCqon7a7GKhAmIrCuyxLU_KyHRFrWAX6Ve_gQgrIeVxXHo'
        audience: 'https://trial-7958725.okta.com'
    google:
      development:
        clientId: '5448985382-ehq8l5p47ach7l689ednab9t5c40og1t.apps.googleusercontent.com'
        clientSecret: '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'
        # clientId: ${AUTH_GOOGLE_CLIENT_ID}
        # clientSecret: ${AUTH_GOOGLE_CLIENT_SECRET}
        # clientId: ${AUTH_OKTA_CLIENT_ID}
        # clientSecret: ${AUTH_OKTA_CLIENT_SECRET}
        # audience: ${AUTH_OKTA_DOMAIN}
        # authServerId: ${AUTH_OKTA_AUTH_SERVER_ID} # Optional
        # idp: ${AUTH_OKTA_IDP} # Optional
        ## uncomment to set lifespan of user session
        # sessionDuration: { hours: 24 } # Optional: supports `ms` library format (e.g. '24h', '2 days'), ISO duration, "human duration" as used in code
        # https://developer.okta.com/docs/reference/api/oidc/#scope-dependent-claims-not-always-returned
        # additionalScopes: ${AUTH_OKTA_ADDITIONAL_SCOPES} # Optional
        # signIn:
        #   resolvers:
        #     # See https://backstage.io/docs/auth/okta/provider#resolvers for more resolvers
        #     - resolver: emailMatchingUserEntityAnnotation
  experimentalClientIdMetadataDocuments:
    enabled: false
    # Optional: restrict which `client_id` URLs are allowed (defaults to ['*'])
    # allowedClientIdPatterns:
    #   - 'https://example.com/*'
    #   - 'https://*.trusted-domain.com/*'
    # Optional: restrict which redirect URIs are allowed (defaults to ['*'])
    # allowedRedirectUriPatterns:
    #   - 'http://localhost:*'
    #   - 'https://*.example.com/*'

scaffolder:
  defaultAuthor:
    name: Backstage
    email: backstage@elitecorpusa.com
  # see https://backstage.io/docs/features/software-templates/configuration for software template options

catalog:
  rules:
    - allow: [Component, System, API, Resource, Location, Group, User, Template]

  processingInterval: { seconds: 30 }
  refreshInterval:    { seconds: 30 }
  locations:
    - type: url
      target: https://raw.githubusercontent.com/sairam3333/backstage-catalog-sample3/main/backstage-catalog-new/catalog-info.yaml

  
    # Local example data, file locations are relative to the backend process, typically `packages/backend`
    # - type: file
    #   target: ../../examples/entities.yaml

    # # Local example template
    # - type: file
    #   target: ../../examples/template/template.yaml
    #   rules:
    #     - allow: [Template]

    # Local example organizational data
    # - type: file
    #   target: ../../examples/org.yaml
    #   rules:
    #     - allow: [User, Group]

    ## Uncomment these lines to add more example data
    # - type: url
    #   target: https://github.com/backstage/backstage/blob/master/packages/catalog-model/examples/all.yaml

    # - type: url
    #   target: https://github.com/udhayakiran-stack/template-structure/blob/main/template.yaml
    #   rules:
    #     - allow: [Template]
    ## Uncomment these lines to add an example org
    # - type: url
    #   target: https://github.com/backstage/backstage/blob/master/packages/catalog-model/examples/acme-corp.yaml
    #   rules:
    #     - allow: [User, Group]

kubernetes:
  serviceLocatorMethod:
    type: multiTenant

  clusterLocatorMethods:
    - type: gke
      projectId: backstage-demo-499507
      region: asia-south1
  googleServiceAccount:
    $file: ./backstage-key.json
  # see https://backstage.io/docs/features/kubernetes/configuration for kubernetes configuration options

# see https://backstage.io/docs/permissions/getting-started for more on the permission framework
permission:
  # setting this to `false` will disable permissions
  enabled: true

# see https://backstage.io/docs/ai/mcp-actions for more details
mcpActions:
  name: 'My Company Backstage' # defaults to "backstage"
  description: 'Tools for managing your software catalog, creating new services from templates, and exploring your developer portal' # optional
