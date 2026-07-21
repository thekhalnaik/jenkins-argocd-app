FROM jenkins/inbound-agent:latest

USER root

# Node.js 20.x (needed for npm install / npm test stages)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && node --version \
    && npm --version

# Docker CLI only (not the daemon - we'll mount the host's docker.sock so this
# CLI talks to the EC2-1 host's Docker daemon instead of running its own)
RUN apt-get update \
    && apt-get install -y ca-certificates curl gnupg \
    && install -m 0755 -d /etc/apt/keyrings \
    && curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg \
    && chmod a+r /etc/apt/keyrings/docker.gpg \
    && echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
      $(. /etc/os-release && echo $VERSION_CODENAME) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install -y docker-ce-cli \
    && docker --version

# AWS CLI v2 (needed later for ECR auth)
RUN apt-get install -y unzip \
    && curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws \
    && aws --version

# git is already present in the base image, but confirm
RUN git --version

USER jenkins
