# braille

# Running locally

## Dependencies for local development

- Docker Desktop
- Playwright (if running e2e tests)
- Python 3
- Localstack
- graphicsmagick
- ghostscript

https://docs.localstack.cloud/user-guide/integrations/terraform/
`pip3 install terraform-local`

### Terraform Local Overrides

Create this file `infrastructure/services/localstate_state_override.tf`

```tf
terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}

variable "LOCALSTACK" {
  type    = bool
  default = true
}
```

### Start up

- Install npm dependencies with `yarn`
- Create the `localstack` docker network via `docker network create localstack`
- Start docker `docker-compose up`
- Initialise local aws stack `yarn tflocal:init`
- Deploy services to local aws stack `yarn tflocal:apply`
- tap enter for both private and public keys to skip
- type `yes` to perform actions
- Copy environment variables from terraform output into `.env` for both `application` and `worker` under the `##LOCALSTACK` section
- Within `packages/prisma` and create a .env file and put in `POSTGRES_PRISMA_URL="postgresql://dbmaster:dbpassword@127.0.0.1:5432/application"`
- Within the same prisma directory you need to run the migrate script to setup the db by running the `db migrate` script within the `package.json`
- Run the `db:studio` command within the same file

### Running Playwright Tests

- Create certificates by running `yarn certs`
- Create `.env`
- Start docker `docker-compose up`

### Stuff for Sean to fix

- [ ] Fix the type definition for the icon to not bypass
- [x] Create a colour picker in the settings page and hook it up to the workspace actions

### Switching from remote (aws) to local (localstack)

- [ ] Update the main.tf file to use local backend instead of remote
- [ ] Set the LOCALSTACK variable to true (services variables.tf)
- [ ] Set aws region to us-east-1
- [ ] Delete terraform state files
- [ ] Navigate to `infrastructure/services` and run `terraform init -reconfigure`
- [ ] Run terraform state list to view all local resources

### Switching from local (localstack) to remote (aws)

- [ ] Update the main.tf file to use local backend instead of remote
- [ ] Set aws region to ca-central-1 / australia-east-1
- [ ] Set the LOCALSTACK variable to false (services variables.tf)
- [ ] Delete terraform state files
- [ ] Navigate to `infrastructure/services` and run `terraform init -reconfigure`
- [ ] Run terraform state list to view all remote resources
