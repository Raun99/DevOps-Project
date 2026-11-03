output "namespace_name" {
  description = "The name of the created Kubernetes namespace"
  value       = kubernetes_namespace.clandestine.metadata[0].name
}

output "quota_name" {
  description = "The name of the resource quota applied to the namespace"
  value       = kubernetes_resource_quota.clandestine_quota.metadata[0].name
}
