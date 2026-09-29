
# ---- hexokit.com composition (appended at deploy by sahil87/hexokit-site) ----
# Everything above is sahil87/shll scripts/install.sh, fetched verbatim at
# deploy time. hexokit.com/install is product-first: with no tool arguments it
# installs shll and HexoKit (roster/formula name `hexokit`), then points at the
# rest of the toolkit. Tool arguments pass through unchanged:
#   curl -fsSL https://hexokit.com/install | sh -s -- fab-kit wt
hexokit_default=0
if [ "$#" -eq 0 ]; then
    hexokit_default=1
    # No capability probe needed: the upstream bootstrap above upgrades an
    # already-installed (brew) shll before `shll install`, so the shll that
    # parses this argument always knows `hexokit`.
    set -- hexokit
fi
# Subshell on purpose: main ends in `exec shll update`, which would replace
# this process before the hint below could print. `set -e` still aborts the
# script (non-zero exit, no hint) when anything inside main fails.
( main "$@" )
if [ "$hexokit_default" -eq 1 ]; then
    echo
    echo "HexoKit is installed (run it: rk). The rest of the toolkit is one command away:"
    echo "  shll install              # fab-kit, wt, idea, tu, hop"
    echo "  https://hexokit.com/toolkit/"
fi
