FROM nginx:mainline
COPY ./s2i/bin/ /usr/libexec/s2i/
LABEL io.openshift.s2i.scripts-url=image:///usr/libexec/s2i
COPY nginx.conf.template /tmp/
COPY default.conf /etc/nginx/conf.d/
RUN mkdir -p /etc/nginx/
RUN echo "" > /etc/nginx/adminServerEnvironmentSettings.js
RUN mkdir -p /tmp/app/dist/admin
RUN ln -sf /etc/nginx/adminServerEnvironmentSettings.js /tmp/app/dist/admin/adminServerEnvironmentSettings.js
# changed /etc to /etc/nginx as error thrown from ibm run cloud on this line
# /etc/nginx was seen to require chmod 777 much later in deployment
RUN chmod -R 0777 /tmp /var /etc/nginx /mnt /usr/libexec/s2i/
RUN chmod 777 /run
EXPOSE 8080
USER 104
