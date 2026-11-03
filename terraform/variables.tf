variable "kubeconfig_path" {
  type        = string
  description = "Path to the local kubeconfig file"
  default     = "~/.kube/config"
}

variable "namespace" {
  type        = string
  description = "Target Kubernetes namespace for CLANDESTINE deployment"
  default     = "clandestine"
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "development"
}
