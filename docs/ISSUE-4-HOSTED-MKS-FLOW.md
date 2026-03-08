# Issue #4 — Hosted MKS operator flow (Rancher + OVH) and teardown SOP

Issue: https://github.com/sneederco/docker-machine-driver-ovh/issues/4

This document maps the **operator-visible flow** in Rancher UI to the hosted MKS lifecycle (create/scale/delete), and defines teardown checks for hourly-billed resources.

---

## A) Hosted create flow (operator sequence)

1. Rancher: **Cluster Management → Create → Hosted Kubernetes**.
2. Select OVH provider integration.
3. Supply project/region/version inputs.
4. Submit cluster create.
5. Confirm cluster enters provisioning state and later `Active`.

Backend reference commands (for API parity checks):

```bash
# list hosted clusters for project
curl -sS "https://api.ovh.com/1.0/cloud/project/${OVH_PROJECT_ID}/kube" | jq .
```

Expected parity:
- Rancher hosted cluster appears
- OVH API lists matching `name`, `region`, `version`

---

## B) Hosted scale flow (nodepool)

Scale actions should map to OVH nodepool desired node updates.

```bash
# list nodepools
curl -sS "https://api.ovh.com/1.0/cloud/project/${OVH_PROJECT_ID}/kube/${MKS_ID}/nodepool" | jq .

# scale a pool
curl -sS -X PUT "https://api.ovh.com/1.0/cloud/project/${OVH_PROJECT_ID}/kube/${MKS_ID}/nodepool/${NODEPOOL_ID}" \
  -H "Content-Type: application/json" \
  -d '{"desiredNodes":5}'
```

Operational check:
- Rancher UI target node count and OVH `desiredNodes` stay aligned.

---

## C) Hosted delete flow

Delete order:
1. Drain/scale down node pools.
2. Delete node pools.
3. Delete hosted cluster.

```bash
curl -sS -X DELETE "https://api.ovh.com/1.0/cloud/project/${OVH_PROJECT_ID}/kube/${MKS_ID}/nodepool/${NODEPOOL_ID}"
curl -sS -X DELETE "https://api.ovh.com/1.0/cloud/project/${OVH_PROJECT_ID}/kube/${MKS_ID}"
```

Validation:
- Cluster removed from Rancher Hosted cluster list.
- OVH API no longer returns deleted cluster id.

---

## D) Hourly billing teardown checklist (operator handoff)

- [ ] Node pools used for test run are scaled down to zero.
- [ ] Temporary node pools are deleted.
- [ ] Temporary hosted cluster is deleted.
- [ ] Any created LBs/public IPs/volumes from test workloads are removed.
- [ ] Billing dashboard checked to ensure no ongoing hourly charges from test environment.
- [ ] Evidence note posted to issue #4 with timestamps and cluster/nodepool IDs.

---

## E) Rollback / cleanup checklist

If a delete action fails:

- [ ] Re-check pending nodepool operations and retry delete.
- [ ] Remove dependent load balancers/volumes that block cluster removal.
- [ ] Re-run cluster delete after dependencies clear.
- [ ] Escalate to OVH support for persistent API errors (include project id, cluster id, operation id).
- [ ] Log blocker owner and next ETA in issue update.
