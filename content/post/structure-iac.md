---
date: 2022-02-13
linktitle: Structuring Your Infrastructure as Code
menu: main
title: Structuring Your Infrastructure as Code
tags: [iac, layered design, terraform]
categories: [iac, layered design, terraform]
---

When using infrastructure as code (IaC), [basic architectural principals](/post/platform-setup/#basic-architectural-principles) can be used as guidelines to create purpose built, operationally simple, platforms. These principles ensure that resources created are immutable and grouped according to lifecycle and purpose.

## Lifecycle Grouping

Grouping resources allows for an approach where an environment is built from different layers, with each subsequent layer having a shorter lifecycle than the one it is built upon. This means we can make changes for a specific group of resources, which reduces the ‘blast radius’, and reduces operational complexity of changes. It also theoretically allows to shift ownership of a certain layer without impacting platform architecture.

## Layers in Infrastructure as Code

I'm a big fan of Terraform as a tool to create your infrastructure. From here onwards I'll be using Terraform as the IaC tool to show how one could layer their code. But this can be extrapolated to be used with other tools like [Pulumi](https://www.pulumi.com/) or [AWS CDK](https://aws.amazon.com/cdk/).

### Terraform Environments

We want to have harmonized environments that are consistent with each other, with any differences being limited to sizing. For each environment we separate the infrastructure into layers according to our lifecycle grouping.

  * A Layer:
    - can implement generic component modules where applicable (Buy over Build)
    - should only use generic component modules that are published in an approved Module Registry (eg. the official [Terraform Module Registry](https://registry.terraform.io/) or an approved [Terraform Cloud Private Module Registry](https://www.terraform.io/cloud-docs/registry/using))
    - should preferably have no more than 1 layer of module nesting
    - has its own Terraform plan, which implements the Layer (and in theory nothing else)

In the root of an environment (`env_name`) directory there should be all the layers that are needed to create the environment. Each layer folder should have at least the basic `.tf` files:
- **_main.tf_**: the base of the environment module code. This section references Terraform modules to be used.
- **_backend.tf_**: define where the backend for the `.tfsate` file is set.
- **_provider.tf_**: define provider being used to deploy the module here.
- **_override.tf.example_**: any example of possible portions of the module that should be overridden. This should usually not be needed, more info can be found in the [Terraform documentation](https://www.terraform.io/language/files/override).

**Terraform State**

Whenever a Terraform plan is run within each module folder, used to create the underlying environment, a `terraform.tfstate` file is created.
This is used to control and version the Terraform IaC. This should be stored in a remote bucket and locked as described in the [state documentation](https://www.terraform.io/language/state).

### Terraform Modules

When creating your modules, just like everything else, there isn't a one size fits all and business requirements need to be considered. But I've found the following structure to be a good starting point when designing a platform.

  * Any Terraform module:
    - should conform to the official [Terraform Module Structure](https://www.terraform.io/language/modules/develop#module-structure)
    - include proper documentation (README, CONTRIBUTING, LICENSE)
    - have properly documented inputs and outputs, if any (this can be automated via pre-hooks)

In the root of a `module_name` directory there should be a `README.md` file, and the basic `.tf` files:
- **_main.tf_**: the base of the module code. Create resources here.
- **_locals.tf_**: here you define ‘local’ values. These can be defaults that should not be changed or that are composed from variables.
- **_data.tf_**: here you define any data resources which you might need from previous layers. At times it might be feasible to collate data resources within the `main.tf` file.
- **_outputs.tf_**: define module outputs here.
- **_variables.tf_**: define variables here.
- **_versions.tf_**: define Terraform or provider versions here.

> _Note: This is not a comprehensive list of files that can exist in the `env_name` and `module_name` directories. Examples of other files could be `dns.tf`, `iam.tf`, etc._

The resulting IaC structure would end up having the following format:

```bash
envs
├── <env_name>
├──── <layer>
├────── main.tf
├────── backend.tf
├────── provider.tf
├────── override.tf.example
modules
├── <module_name>
├──── README.md
├──── main.tf
├──── locals.tf
├──── data.tf
├──── variables.tf
└──── versions.tf
```

## GCP Example

The following [repo](https://github.com/TimothyMamo/structure-iac) has an example of how I would, start to, structure my Terraform code to create various environments, each having a GKE cluster with a managed Postgres CloudSQL database.

> _N.B. Even though the repo has a `prd` environment example, the code is **NOT** production ready. There are a fair few improvements which I would want to implement before even considering the code production ready._

## Conclusion

 In this post we've seen how you can start structuring Terraform code for your needs. Following [basic architectural principals](/post/platform-setup/#basic-architectural-principles) allows you to structure your IaC according to lifecycle groupings. With Terraform this can be achieved by grouping modules in layers within environment specific folders. This should allow you to have harmonized environments that are reproducible and that can be deployed with a _"click of a button"_.