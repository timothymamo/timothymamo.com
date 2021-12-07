---
date: 2021-04-09
linktitle: Designing a Layered Platform in the Cloud
menu: main
title: Designing a Layered Platform in the Cloud
tags: [platform, layered design, infra]
categories: [platform, layered design, infra]
---

I've been designing, creating and maintaining platforms for a few years now. I've learnt a fair amount on what works and what doesn't and how best to take advantage of infrastructure that you can create in the cloud. Most of this was due to working with amazing people at my previous job ([Skyworkz](https://skyworkz.nl)) and at my current job ([Container Solutions](https://www.container-solutions.com)). But also through the talks and readings of people like [Kelly Shortridge](https://www.kellyshortridge.com/) and [Martin Fowler](https://martinfowler.com/).

The cloud has enabled companies to innovate at amazing speeds, by facilitating growth, deploying faster and continuously improving. All of this whilst also being more reliable and secure. This is vital for them to succeed. But I've found that this is only possible when the underlying infrastructure and applications aiding this growth are distributed, immutable and ephemeral as much as possible. This has been made possible with the offerings from cloud providers (AWS, Azure, GCP) and open source projects like kubernetes and more.

The following is a high level overview of how I think platform design should be structured in a layered way.

## Objectives

When designing a platform there are 3 main objectives I try to keep in mind:

1. Easy operational workflows: Creating and destroying environments `at the press of a button`.
2. Harmonized environments: all environments are built from a generic Platform Setup. Making them consistent is vital and any differences between them should be limited to sizing.
3. A foundation to build upon: a platform setup that allows easy implementation and further improvements. This is probably the most difficult to do but also the most important. You don't know what the future holds, but you also need to be adaptable to change your company is fluid and the platform needs to change with it.

## Basic Architectural Principles

Following on from the objects, I also try to adhere to a set of generic design principles. These principles are used as a guidance in the choices I make and do not dictate any specific technologies. The only time where I won't adhere to these principles, although some might still come into play, is when I'm building an [MVP](https://en.wikipedia.org/wiki/Minimum_viable_product) to prove my hypothesis.

- Buy over Build: I prefer to use off-the-shelf products, rather than over engineering your own. This is something the cloud has enabled and we should take full advantage of it. Managing your own database is a thing of the past with products like AWS's RDS, GCP's CloudSQL or Azure's SQL.
- Purpose-Built: Every company is different. I prefer to build a platform that matches the needs and wants of each particular company. This also helps accelerate the needs and workflows of that company.
- KISS: Keep things as simple as possible. There may be the need to use complex technologies to reach our objectives. If this is the case, the implementation needs to be as simple as possible.
- Platform-unaware Applications / Application-unaware Platform: I want generic interfaces between application and platform. This allows the applications to be portable. The [12 factor app](https://12factor.net/) methodology can come in handy here. Similarly the platform need to be designed to be able to change overtime.
- Engineering Complexity over Operational Complexity: At times complexity is unavoidable. If that's the case, operational workflows should always be easy. I'd rather spend a little more effort and time in engineering a good platform over something that is hard to operate.
- Good over Fast: prefer to ship a solid and stable product over shipping faster at the cost of reliability. 

## Layered Platform Approach

![Example Layered Platform](/Layerd_Platform.png#c)

The various objectives and principles are all interlinked. Harmonization of environments, as well as being on-demand, not only enables accelerated productivity for my customers (the developers), but also helps with platform development and other use-cases, like upgrades and disaster recovery. By making it easy to create, update and destroy platforms with a `press of a button`, from generic infrastructure code, we can enable these use-cases.

The platform should consist of a loosely coupled structure where resources are grouped into layers based on lifecycle. A simplified workflow is used, where environment resources can be created (and updated) from templates.

The idea here is that resources are grouped based on lifecycle and ownership, called layers. These layers need to take into account the following:

- At what point should this resource start to exist?
- At what point should this resource stop to exist?`
- Who should be responsible for creating the resource?
- Who should be responsible for managing the resource?
- What are the inter-resource dependencies?

Once these layers are identified, we can create, update and destroy layers without affecting the underlying layers. As shown in the image above there will be inter-layer dependencies (but these are easier to grasp than a large collection of inter-resource dependencies).

#### Considerations for a layered approach

While a layered approach will reduce operational complexity, it isn’t a magic solution. It is better than a monolithic approach in some ways, and a little worse in others.

When using a layered platform approach the advantages are:

- Reduced ‘blast radius’ of changes. You’ll only affect the layer you’re actually changing.
- Clear distinction between different lifecycles and logical groups. This makes it easier to understand the platform architecture without getting lost in inter-resource dependencies.
- Reduces the possibility of introducing ‘incorrect’ inter-resource dependencies to a resource that has a shorter lifecycle.
- Possibility to introduce granular separation of concerns. This makes it easier for [stream-aligned teams](https://teamtopologies.com/key-concepts) to add resources to the platform, while maintaining compliance and proper separation of concerns.
- It becomes easier to move towards immutable and ephemeral infrastructure across the board, going layer by layer.

However, there are also things to keep in mind:

- For each resource you need to have a clear understanding of its lifecycle, ownership, and dependencies.
- Inter-layer dependencies need to be clear. Referencing attributes from resources in a different layer can be fairly complex. Specific dependencies (e.g. EKS needs Subnet IDs which may be in a different layer) need to be explicitly specified. This adds some complexity.

## Conclusion

Creating a Layered platform in the cloud requires knowledge of the business needs, both internal and external. This is why there isn't a one size fits all solution. Having concrete Objectives and Principles that can be followed during this design process ensures that the platform takes advantage of what the cloud brings to the table. Infrastructure that can be distributed, immutable and ephemeral. Whilst also empowering teams to deploy their own resources enabling fast delivery of customer requirements.