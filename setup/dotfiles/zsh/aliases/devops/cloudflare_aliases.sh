# Wrangle Pages
alias wranglerls='npx wrangler pages project list'
alias wranglerdeploy='npx wrangler pages deploy'
alias wranglerdelete='npx wrangler pages delete'
# R2 Storage
alias r2ls='npx wrangler r2 bucket list'
alias r2create='npx wrangler r2 bucket create'
alias r2delete='npx wrangler r2 bucket delete'
function r2clear() {
    aws s3 rm "s3://$1" --endpoint-url "https://$CLOUDFLARE_ID.r2.cloudflarestorage.com" --recursive
}
