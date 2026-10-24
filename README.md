# Araştırma Trend Radarı (Yapay Zekâ ve Siber Güvenlik)

Bu proje, Kullanıcı Arayüzü Tasarımı ile Bulut Bilişim ve Siber Güvenlik derslerinin ortak deposudur.

## Mimari Diyagram ve Veri Akışı

```mermaid
graph TD
    A[Kullanıcı / Araştırmacı] -->|HTTPS İstediği| B(AWS CloudFront / S3)
    B -->|Statik Web Sitesi| A
    C[GitHub Actions - CI/CD] -->|Terraform Dağıtımı| B
    C -->|Otomatik Veri Çekimi| D{Veri Hattı API}
    D -->|JSON Yanıtı| E[OpenAlex API]
    D -->|Zaman Damgalı Snapshot| F[(GitHub Deposu / Veri)]
    
    classDef security stroke:#ff0000,stroke-width:2px;
    class E security;