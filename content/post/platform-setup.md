---
date: 2021-04-09
linktitle: Designing a Layered Platform in the Cloud
menu: main
title: Designing a Layered Platform in the Cloud
tags: [platform, layered design, infra]
categories: [platform, layered design, infra]
---

## Introduction

I've been designing, creating and maintaining platforms for a few years now and I've learnt a fair amount on what works and what doesn't, and how best to take advantage of the infrastructure that can be created in the cloud. The cloud has enabled companies to innovate at amazing speeds facilitating growth, move faster and continuously improve, and be more reliable and secure. All of this is vital for them to succeed. But I've found out that this is only possibly when the underlying infrastructure and applications aiding this growth are distributed, immutable and ephemeral as much as possible. all of which has been made possible with the offerings of the likes of AWS, Azure, GCP and open source projects like kubernetes and more.

Most of this has been through working with amazing people like [Benny Cornelissen](https://blog.bennycornelissen.nl/) and [Sander Knape](https://sanderknape.com/), but also through the talks and readings of people like Kelsey Hightower and Martin Fowler. The following is a high level overview of how I think platform design should be structured in a layered way.

## Objectives

When designing a platform there are 3 main objectives I try to keep in mind:

1. Easy operational workflows: Creating and destroying environments `at the press of a button`.
2. Harmonized environments: all environments are built from a generic Platform Setup, making them consistent, and any differences between environments should only be limited to sizing.
3. A foundation to build upon: a platform setup that allows easy implementation and further improvements.

## Basic Architectural Principles

Going forward, a set of generic design principles should be adhered to. These principles do not dictate any specific technology choices, but will be used as guidance in making choices going forward.

- Buy over Build: prefer to use off-the-shelf products or components over engineering your own equivalents.
- Purpose-Built: prefer to build a platform to match and therefore accelerate the needs and workflows of the company.
- Good over Fast: prefer to ship a solid and stable product over shipping faster at the cost of reliability.
- KISS: keep things as simple as possible. There may be the need to use complex technology to reach our goals, but we choose to make our implementations as simple as possible.
- Engineering Complexity over Operational Complexity: some complexity may be unavoidable, but the operational workflows should always be easy. It is preferable that something that takes a little more effort to engineer over something that is hard to operate.
- Platform-unaware Applications / Application-unaware Platform: aim to use generic interfaces between application and platform, allowing the applications to be portable, and platform technology to change overtime while preventing legacy-dependencies.

## Layered Platform Approach

The various objectives are all interlinked. Harmonization of environments, accelerating productivity for customers (developers). On-demand environments help with platform development and possibly some other use-cases, like disaster recovery. By making it easy to create, update and destroy platforms from a generic infrastructure codebase, we can enable these use-cases.

The approach is to create a Platform setup that can be used by other teams if wanted/needed. This will consist of a loosely coupled structure where resources are grouped into layers based on lifecycle. We will use a simplified workflow, where environment implementation code can be created (and updated) from templates.

The idea here is that resources are grouped based on lifecycle and ownership. These groups are called layers. Which means that we take into account the following:

- At what point should this resource start to exist?
- At what point should this resource stop to exist?
- Who should be responsible for creating the resource?
- Who should be responsible for managing the resource?
- What are the inter-resource dependencies?

Then, when we identified these layers, we can create, update and destroy layers without affecting the underlying layers. As shown in the image, there will be inter-layer dependencies (but these are easier to grasp than a large collection of inter-resource dependencies).

#### Considerations for a layered approach

While a layered approach will reduce operational complexity, it isn’t a magic solution. It is better than a monolithic approach in some ways, and a little worse in others.

Comparing to a monolithic setup, it basically means:

1. Monolithic: a single Terraform run to update an environment variable in the EKS Cluster might redeploy all services or update a routing table in the VPC
2. Layered: a single Terraform run to update an environment variable in the EKS Cluster can never touch anything outside of that specific layer (like a routing table or service deployment, since they are in different layers)

Using a layered platform approach has several clear advantages:

- Reduced ‘blast radius’ of changes. You’ll only affect the layer you’re actually changing.
- Clear distinction between different lifecycles and logical groups. This makes it easier to make sense of the platform architecture without getting lost in inter-resource dependencies.
- Inability to introduce ‘incorrect’ inter-resource dependencies to a resource that has a shorter lifecycle.
- Possibility to introduce more granular separation of concerns. This also makes it easier for high-maturity software teams to add self-managed infrastructure components in the platform while maintaining a proper separation of concerns.
- It becomes easier to move towards immutable infrastructure across the board, going layer by layer.

However, there are also things to keep in mind:

- For each resource you need to have a clear understanding of its lifecycle, ownership, and dependencies.
- Inter-layer dependencies need to be clear, as you cannot generally reference attributes from resources in a different layer, or adds complexity to do so. Specific dependencies (e.g. EKS needs Subnet IDs which may be in a different layer) need to be explicitly specified. This adds some complexity.

## Conclusion

