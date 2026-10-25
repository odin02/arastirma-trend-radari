terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-central-1" # Frankfurt Bölgesi
}

# 1. BULUT BİLİŞİM: Sitemizin barınacağı AWS S3 Bulut Kasası
resource "aws_s3_bucket" "arastirma_radari_depo" {
  bucket = "arastirma-trend-radari-bengisu"

  tags = {
    Name        = "Araştırma Trend Radarı"
    Environment = "Final Teslimi"
  }
}

# 2. SİBER GÜVENLİK: Dışarıdan yetkisiz erişimi ve sızıntıları engelleme kilidi
resource "aws_s3_bucket_public_access_block" "guvenlik_kilidi" {
  bucket                  = aws_s3_bucket.arastirma_radari_depo.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}