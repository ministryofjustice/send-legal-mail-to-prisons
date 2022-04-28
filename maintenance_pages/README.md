# Maintenance Pages

## Overview

In the event of planned or unplanned downtime we prefer to show a maintenance page rather than leave users hanging.

The method used to host a maintenance page is largely borrowed from the [Cloud Platform maintenance page](https://github.com/ministryofjustice/cloud-platform-maintenance-page).

### Prerequisites

In order to deploy the maintenance page you need:
* access to the Cloud Platform `live` Kubernetes cluster
* access to the Kubernetes namespace `send-legal-mail-to-prisons-prod` (e.g. you must be a member of GitHub group `farsight-devs`)
* kubectl installed and configured to access the Cloud Platform `live` Kubernetes cluster

In order to change the contents of the maintenance page you need:
* access to the `ministryofjustice` Dockerhub account with push privileges to repository `slm-maintenance`

## How to deploy a maintenance page

We will deploy new Kubernetes services to our production namespace for both the internal and external UIs (Send legal mail and Check Rule39 mail). We can then point our ingresses to the maintenance page services while the application is down.

Note that this will only work if Cloud Platform's Kubernetes instance is up and running. We do not currently have a solution for displaying a maintenance page if Cloud Platform is down for an reason.

### Deploying the maintenance page

We have slightly different content depending on whether the downtime is planned (scheduled) or unplanned (unscheduled). The env var `INDEX_NAME` in the files `kubectl_deploy/maintenance-deploy-*.yaml` is used to determine which html file to use.

If using the content in `index-*-scheduled.html` then you will need to set the time and date found in `<article class="main-content">`. 

From this directory run command:
```
kubectl apply -f kubectl_deploy -n send-legal-mail-to-prisons-prod
```
This will create pods called `maintenance-page-slm` and `maintenance-page-cr39` and services called `maintenance-page-svc-slm` and `maintenance-page-svc-cr39` in the `send-legal-mail-to-prisons-prod` namespace.

### Redirecting traffic to the maintenance page

To redirect traffic to the maintenance page we need to point both the SLM and CR39 ingresses to the maintenance page services.

This involves changing the value of `spec/rules/http/paths/backend/serviceName` in file `helm_deploy/send-legal-mail-to-prisons/templates/ingress.yaml` for both ingresses.

The ingress named `check-rule39-mail` should change `serviceName` to `maintenance-page-cr39-svc` and the ingress named `send-legal-mail-to-prisons` should change `serviceName` to `maintenance-page-slm-svc`. The changes will be applied when the application is redeployed.

Advanced Kubernetes users may wish to just edit the ingresses in place but be aware that a redeployment of the application will override manual updates.

### Cleaning up

When the service is back up we need to point the ingresses back to the application service and remove the maintenance page services.

Reverse the changes previously made to the ingress files using the same method as before. Both ingresses should have `serviceName: send-legal-mail-to-prisons`.

Delete the maintenance page resources by running this command from this directory:
```
kubectl delete -f kubectl_deploy -n send-legal-mail-to-prisons-prod
```
