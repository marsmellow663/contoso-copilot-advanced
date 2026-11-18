| Layer | Control | Owner | Status |
|---|---|---|---|
| ① GitHub AI controls | Copilot features (chat, agents, cloud agent, code review) | Organisation | Enforced |
| ① GitHub AI controls | Model availability + "Default availability" for new models | Organisation | Enforced |
| ① GitHub AI controls | MCP servers in Copilot policy | Organisation | Enforced |
| ① GitHub AI controls | Content exclusion | unknown | unknown |
| ② Enterprise-managed settings | `permissions` / `sandbox` | unknown | unknown |
| ② Enterprise-managed settings | Default `model` / `fusionTier` | unknown | unknown |
| ② Enterprise-managed settings | MCP allow / deny lists |unknown | unknown |
| ③ VS Code device policies | ChatAgentMode · ChatToolsAutoApprove · ChatMCP | VSCode | Enforced |
| Repository | preToolUse guardrail hook (`.github/hooks/`) — Step 4 | me (this lab) | |
| Repository | Branch ruleset on `main` — Step 5 | me (this lab) | |
| Repository | CI check `Test` (`.github/workflows/ci.yml`) | | ✅ |