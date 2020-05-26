FROM nginx:mainline

ENV STI_SCRIPTS_PATH=/usr/libexec/s2i

COPY ./s2i/bin/ $STI_SCRIPTS_PATH/
LABEL io.openshift.s2i.scripts-url=image://$STI_SCRIPTS_PATH
COPY nginx.conf.template /tmp/
COPY default.conf /etc/nginx/conf.d/
RUN mkdir -p /etc/nginx/
RUN echo "" > /etc/nginx/adminServerEnvironmentSettings.js
RUN mkdir -p /tmp/app/dist/admin
RUN ln -sf /etc/nginx/adminServerEnvironmentSettings.js /tmp/app/dist/admin/adminServerEnvironmentSettings.js
# changed /etc to /etc/nginx as error thrown from ibm run cloud on this line
# /etc/nginx was seen to require chmod 777 much later in deployment
# RUN chmod -R 0777 /tmp /var /etc/nginx /mnt /usr/libexec/s2i/
# =================================================================================
# Fix up permissions
# ref: https://torstenwalter.de/openshift/nginx/2017/08/04/nginx-on-openshift.html
# - S2I sripts must be executable
# - Make sure nginx can read and write it's working directories.
# - The container dynamically configures nginx on startup
# - The application artifacts live in /tmp
# ---------------------------------------------------------------------------------
RUN chmod -R g+rwx $STI_SCRIPTS_PATH
RUN chmod g+rw /var/cache/nginx \
               /var/run \
               /var/log/nginx \
               /etc/nginx/adminServerEnvironmentSettings.js \
               /etc/nginx/nginx.conf
# =================================================================================
RUN chmod 777 /run /tmp
EXPOSE 8080
USER 104
