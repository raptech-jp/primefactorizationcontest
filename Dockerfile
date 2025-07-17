# syntax=docker/dockerfile:1
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 必要に応じてビルド系（gcc等）が要るライブラリがあれば追加
# 何も不要ならこのRUNを削ってOK
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 依存インストール（キャッシュ効かせるため先にコピー）
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリ本体
COPY . .

# SQLite保存用ディレクトリ（永続化時に使う）
RUN mkdir -p /data && mkdir -p /app/instance

# デフォルト環境（docker-compose側で上書き可）
ENV SQLALCHEMY_DATABASE_URI=sqlite:////data/db.point
ENV SECRET_KEY=change-me-in-prod
ENV FLASK_ENV=production

EXPOSE 5000

# 開発向け: Flask組み込みサーバで動かす（app.py内mainを利用）
CMD ["python", "app.py"]
