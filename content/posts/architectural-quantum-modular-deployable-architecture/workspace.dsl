workspace "Architectural Quanta Example" "An example illustrating architectural quanta." {

    model {
        // --- Elements ---
        softwareSystem = softwareSystem "E-commerce Platform" "Our example e-commerce platform." {
            pricingService = container "Pricing Service" "Calculates prices for products." "Java"
            auditingService = container "Auditing Service" "Audits every pricing calculation." "Java"
            notificationsService = container "Notifications Service" "Sends notifications to users." "Java"
            eventBroker = container "Event Broker" "Handles asynchronous eventing." "Kafka" {
                tags "Event Broker"
            }
        }

        // --- Relationships ---
        pricingService -> auditingService "Makes a synchronous call to log the calculation" "JSON/HTTP"
        pricingService -> eventBroker "Publishes 'PriceCalculated' event" "JSON/Async"
        eventBroker -> notificationsService "Delivers 'PriceCalculated' event" "JSON/Async"

        // --- Deployment Model for Quanta ---
        deployment = deploymentEnvironment "Production" {
            quantum1 = deploymentNode "Architectural Quantum 1" "A single unit of deployment." {
                pricingInstance = containerInstance pricingService
                auditingInstance = containerInstance auditingService
            }

            quantum2 = deploymentNode "Architectural Quantum 2" "An independent unit of deployment." {
                notificationsInstance = containerInstance notificationsService
            }

            // The event broker runs in its own deployment node (e.g. a Kafka cluster)
            kafkaCluster = deploymentNode "Kafka Cluster" "Shared Event Broker Infrastructure." {
                eventBrokerInstance = containerInstance eventBroker
            }
        }
    }

    views {
        // A deployment view showing how containers are grouped into quanta
        deployment softwareSystem "Production" "ArchitecturalQuanta" {
            include *
            autolayout
        }

        styles {
            element "Container" {
                background #1168bd
                color #ffffff
                shape RoundedBox
            }
            element "Event Broker" {
                background #90714c
                shape Cylinder
            }
            element "DeploymentNode" {
                background #f0f0f0
                color #333333
                shape RoundedBox
            }
        }
    }
}