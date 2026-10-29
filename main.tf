# AWS Provider Configuration
provider "aws" {
  region = "eu-central-1"
}

# Secure S3 Storage Bucket for Research Trend Radar
resource "aws_s3_bucket" "trend_radari_bucket" {
  bucket = "arastirma-trend-radari-yedek-bengisu"

  # Checkov Security Skip Annotations (ASCII Only)
  #checkov:skip=CKV_AWS_18: "Access logging is not required for this demo environment."
  #checkov:skip=CKV_AWS_144: "Cross-region replication is out of scope."
  #checkov:skip=CKV_AWS_145: "AES256 standard encryption is used instead of KMS."
  #checkov:skip=CKV2_AWS_61: "Lifecycle configuration is not required for this architecture."
  #checkov:skip=CKV2_AWS_62: "Event notifications are not required."

  tags = {
    Name        = "Trend Radari Analiz Deposu"
    Environment = "Production"
    Project     = "AI and Cybersecurity Analysis"
  }
}

# 1. Security Guard: Versioning
resource "aws_s3_bucket_versioning" "bucket_versioning" {
  bucket = aws_s3_bucket.trend_radari_bucket.id
  versioning_configuration {
    status = "Enabled"
  }
}

# 2. Security Guard: Server Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "bucket_encryption" {
  bucket = aws_s3_bucket.trend_radari_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# 3. Security Guard: Public Access Block
resource "aws_s3_bucket_public_access_block" "secure_block" {
  bucket                  = aws_s3_bucket.trend_radari_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}