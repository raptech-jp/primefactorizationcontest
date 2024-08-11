# syntax=docker/dockerfile:1.4
FROM python:3.12-bookworm

WORKDIR /app

COPY . /app/
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

ENTRYPOINT ["python3"]
CMD ["-u", "app.py"]
