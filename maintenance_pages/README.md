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
* docker installed and signed in to the `ministryofjustice` Dockerhub account

## How to deploy a maintenance page

We will deploy new Kubernetes services to our production namespace for both the internal and external UIs (Send legal mail and Check Rule39 mail). We can then point our ingresses to the maintenance page services while the application is down.

Note that this will only work if Cloud Platform's Kubernetes instance is up and running. We do not currently have a solution for displaying a maintenance page if Cloud Platform is down for an reason.

### Deploying the maintenance page

We have slightly different content depending on whether the downtime is planned (scheduled) or unplanned (unscheduled). The env var `INDEX_NAME` in the files `kubectl_deploy/maintenance-deploy-*.yaml` is used to determine which html file to use.

If using the content in `index-*-scheduled.html` then you will need to set the time and date found in `<article class="main-content">` and publish a new Docker image - see [How to change the maintenance page content](#how-to-change-the-maintenance-page-content). 

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

## How to change the maintenance page content

The maintenance pages are served from a Docker image hosted on the ministryofjustice Dockerhub org. The coordinates of the image can be found in the files `kubectl_deploy/maintenance-deploy-slm.yaml` and `kubectl_deploy/maintenance-deploy-cr39.yaml` at location `spec/template/spec/containers/image`.

If you make any changes to the contents of any HTML file - for example if setting the date and time in the scheduled maintenance page - you will need to publish a new Docker image.

### Publishing a new Docker image

* make the change to the html files `index-*.html`
* in a terminal login to your ministryofjustice Dockerhub account with command `docker login`
* work out the next version number for the image - probably just a patch or minor version update
* from this directory rebuild the Docker image with command `docker build . -t ministryofjustice/slm-maintenance:<new-version-number>`
* push the image to Dockerhub with command `docker push ministryofjustice/slm-maintenance:<new-version-number>`


You can now update the image version in files `kubectl_deploy/maintenance-deploy-slm.yaml` and `kubectl_deploy/maintenance-deploy-cr39.yaml` before deploying your maintenance pages.

### Testing a new Docker image locally

Before pushing the new version you might want to test locally to check it works as expected.

To run the image locally run command:
```
docker run -it -p 8080:80 ministryofjustice/slm-maintenance:<your-image-version-number> --env INDEX_NAME=<the-html-file-to-serve>
```

Then go to URL http://localhost:8080 to see the page. 