FROM nginx:mainline
COPY ./s2i/bin/ /usr/libexec/s2i/
LABEL io.openshift.s2i.scripts-url=image:///usr/libexec/s2i
COPY nginx.conf.template /tmp/
COPY default.conf /etc/nginx/conf.d/
RUN mkdir -p /etc/nginx/
RUN echo "" > /etc/nginx/serverEnvironmentSettings.js
RUN mkdir -p /tmp/app/dist/admin
RUN ln -sf /etc/nginx/serverEnvironmentSettings.js /tmp/app/dist/admin/serverEnvironmentSettings.js
RUN chmod -R 0777 /tmp /var /run /etc /mnt /usr/libexec/s2i/
EXPOSE 8080
USER 104
