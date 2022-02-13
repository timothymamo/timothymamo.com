---
date: 2022-02-13
linktitle: Structuring Your Infrastructure as Code
menu: main
title: Structuring Your Infrastructure as Code
tags: [iac, layered design, terraform]
categories: [iac, layered design, terraform]
---

When using infrastructure as code, [basic architectural principals](/post/platform-setup/#basic-architectural-principles) can be used as guidelines to create purpose built, operationally simple, platforms. These principles ensure that resources created are immutable and grouped according to lifecycle and purpose.

## Immutable Resources

By default, most resources created in the cloud are CRUD (Create, Read, Update, Delete). When building immutable infrastructure, the Update part disappears. As the (incremental) updates to resources are most likely to go wrong, and the hardest to test, there is a clear benefit in creating immutable infrastructure. 

In an immutable setup, updating a resource means destroying the old one and creating a new one. This has its own set of challenges, but those are mainly on the engineering side, and not the operational one.

The most prevalent challenges with regard to immutable infrastructure components are:
  1. **_State_**: the resource either should be stateless, or its state should be decoupled so that one can replace the resource without losing state.
  2. **_Dependencies_**: a resource can only depend on another resource if that resource has a longer lifecycle than itself. Breaking this rule will break changes.
  3. **_Uptime_**: some resources need to exist at all times. An approach to immutable resource updates is to destroy the current resource then creating a new one. For resources that require a high level of uptime, this process should be reversed where resources are created before destroyed. Traffic is routed to the newly created resource before the old resource is destroyed, similar to how k8s deals with pods in a `RollingUpdate`.

Keep in mind that not all resources can be made immutable. Some resources have the sole purpose of containing state, which by definition makes them mutable. That is ok, since the lifecycle of the state and the lifecycle of the resource can be equal. Examples of resources that cannot simply be made immutable are buckets or DNS zones.

## Lifecycle Grouping

Grouping resources allows for an approach where an environment is built from different layers, with each subsequent layer having a shorter lifecycle than the one it builds upon. This resolves the dependency challenge mentioned above, but also means we can make changes for a specific group of resources, which reduces the ‘blast radius’, and reduces operational complexity of changes. It also theoretically allows to shift ownership of a certain layer without impacting platform architecture.

## Layers in Infrastructure as Code

From here onwards I'll be using Terraform as the Infrastructure as Code (IaC) tool to show how one could layer their code. But this can be extrapolated to be used with other tools like [Pulumi](https://www.pulumi.com/) or [AWS CDK](https://aws.amazon.com/cdk/).

Implementing the layered model into code means creating a Terraform module for each layer. This in turn can make the implementation plans simpler. When creating a layer module I try to follow theses design rules:

  * A Layer Module:
    - can implement generic component modules where applicable (Buy over Build)
    - should only use generic component modules that are published in an approved Module Registry (eg. the official [Terraform Module Registry](https://registry.terraform.io/) or an approved [Terraform Cloud Private Module Registry](https://www.terraform.io/cloud-docs/registry/using))
    - should preferably have no more than 1 layer of module nesting
    - include proper documentation (README, CONTRIBUTING, LICENSE)
    - have properly documented inputs and outputs, if any (this can be automated via pre-hooks)

### Layer Module Structure in Terraform

I'm a big fan of Terraform as a tool to create your infrastructure. When structuring your layers, just like everything else, there isn't a one size fits all and business requirements need to be considered. But I've found the following structure to be a good starting point when designing a platform.

  * Every logical layer:
    - has its own Terraform module, the Layer Module, as described above.
    - has its own Terraform plan, which implements the Layer Module (and in theory nothing else)
  * Any Terraform module:
    - should conform to the official [Terraform Module Structure](https://www.terraform.io/language/modules/develop#module-structure)
    - should use the Layer Module Structure

#### Terraform Environments

In the root of a `env_name` directory should be all the modules/layers that are needed to create the environment. Each module folder should have at least the basic .tf files:
- **_main.tf_**: the base of the environment module code. This section references terraform modules to be used.
- **_backend.tf_**: define where the backend for the `.tfsate` file is set.
- **_provider.tf_**: define provider being used to deploy the module here.
- **_override.tf.example_**: any example of possible portions of the module that should be overridden. This should usually not be needed, more info can be found in the [Terraform documentation](https://www.terraform.io/language/files/override).

**Terraform State**

Whenever a terraform plan is run within each module folder, used to create the underlying environment, a `terraform.tfstate` file is created.
This is used to control and version the Terraform IaC. This should be stored in a remote bucket and locked as described in the [state documentation](https://www.terraform.io/language/state).

#### Terraform Module

In the root of a `module_name` directory there should be a `README.md` find, and the basic `.tf` files for a module:
- **_main.tf_**: the base of the module code. Create resources here.
- **_locals.tf_**: here you define ‘local’ values. These can be defaults that should not be changed or that are composed from variables.
- **_outputs.tf_**: define module outputs here.
- **_variables.tf_**: define variables here.
- **_versions.tf_**: define Terraform or provider versions here.

> _Note: This is not a comprehensive list of files that can exist in the `env_name` and `module_name` directories. Examples of other files could be `dns.tf`, `iam.tf`, etc._

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

> _N.B. Even though the repo has a `prd` example, the code is not production ready. There are a fair few improvements which I would want to implement before even considering the code production ready._

## Conclusion

