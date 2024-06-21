FROM nginx:1.27

LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

ENV INDEX_NAME=index-slm-unscheduled.html

COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY index-cr39-scheduled.html /usr/share/nginx/html
COPY index-cr39-unscheduled.html /usr/share/nginx/html
COPY index-slm-scheduled.html /usr/share/nginx/html
COPY index-slm-unscheduled.html /usr/share/nginx/html

RUN chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER 101
