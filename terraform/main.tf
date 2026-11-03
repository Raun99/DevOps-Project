terraform {
  required_version = ">= 1.5.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.33.0"
    }
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
}

# 1. Managed Kubernetes Namespace for CLANDESTINE
resource "kubernetes_namespace" "clandestine" {
  metadata {
    name = var.namespace
    labels = {
      "app.kubernetes.io/name"       = "clandestine"
      "app.kubernetes.io/managed-by" = "terraform"
      "app.kubernetes.io/part-of"    = "clandestine"
      "environment"                  = var.environment
    }
  }
}

# 2. Local Resource Quota to ensure pods do not exceed local development limits
resource "kubernetes_resource_quota" "clandestine_quota" {
  metadata {
    name      = "clandestine-compute-quota"
    namespace = kubernetes_namespace.clandestine.metadata[0].name
  }

  spec {
    hard = {
      "requests.cpu"    = "1"
      "requests.memory" = "1Gi"
      "limits.cpu"      = "2"
      "limits.memory"   = "2Gi"
      "pods"            = "10"
    }
  }
}
