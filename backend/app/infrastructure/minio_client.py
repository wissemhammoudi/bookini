import logging
from io import BytesIO

import boto3
from botocore.exceptions import ClientError

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class MinioClient:
    def __init__(self) -> None:
        settings = get_settings()
        self.bucket_name = settings.minio_bucket
        protocol = "https" if settings.minio_secure else "http"
        endpoint_url = f"{protocol}://{settings.minio_endpoint}"

        self.s3 = boto3.client(
            "s3",
            endpoint_url=endpoint_url,
            aws_access_key_id=settings.minio_access_key,
            aws_secret_access_key=settings.minio_secret_key,
            region_name="us-east-1",  # dummy region for MinIO
        )

    def ensure_bucket_exists(self) -> None:
        try:
            self.s3.head_bucket(Bucket=self.bucket_name)
            logger.info(f"MinIO bucket '{self.bucket_name}' already exists.")
        except ClientError as e:
            error_code = e.response.get("Error", {}).get("Code")
            # 404 means bucket does not exist
            if error_code == "404" or error_code == "NoSuchBucket":
                try:
                    self.s3.create_bucket(Bucket=self.bucket_name)
                    logger.info(f"Created MinIO bucket '{self.bucket_name}'.")

                    # Optional: Set bucket policy to allow anonymous read
                    # (since they are public profiles/avatars)
                    # We are proxying, but this is a nice fallback.
                    import json

                    policy = {
                        "Version": "2012-10-17",
                        "Statement": [
                            {
                                "Sid": "PublicRead",
                                "Effect": "Allow",
                                "Principal": "*",
                                "Action": ["s3:GetObject"],
                                "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"],
                            }
                        ],
                    }
                    self.s3.put_bucket_policy(
                        Bucket=self.bucket_name, Policy=json.dumps(policy)
                    )
                except Exception as create_err:
                    logger.error(f"Failed to create MinIO bucket: {create_err}")
                    raise create_err
            else:
                logger.error(f"Failed checking MinIO bucket: {e}")
                raise e

    def upload_file(
        self, file_data: bytes, object_name: str, content_type: str
    ) -> None:
        try:
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=object_name,
                Body=BytesIO(file_data),
                ContentType=content_type,
            )
            logger.info(f"Successfully uploaded '{object_name}' to MinIO.")
        except Exception as e:
            logger.error(f"Failed to upload file '{object_name}' to MinIO: {e}")
            raise e

    def get_file(self, object_name: str) -> bytes:
        try:
            response = self.s3.get_object(Bucket=self.bucket_name, Key=object_name)
            return response["Body"].read()
        except Exception as e:
            logger.error(f"Failed to retrieve file '{object_name}' from MinIO: {e}")
            raise e
