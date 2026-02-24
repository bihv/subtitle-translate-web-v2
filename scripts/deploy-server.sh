#!/bin/bash
# ============================================================================
# 🚀 Auto Deploy: Next.js + Cloudflare Tunnel
# ============================================================================
# Usage:
#   curl -sSL <raw-url>/deploy-server.sh | bash
#   or: chmod +x deploy-server.sh && ./deploy-server.sh
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_step() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

prompt() {
    local var_name="$1"
    local prompt_text="$2"
    local default_value="$3"
    local is_secret="$4"

    if [ -n "$default_value" ]; then
        prompt_text="$prompt_text [$default_value]"
    fi

    if [ "$is_secret" = "true" ]; then
        read -sp "    $prompt_text: " value
        echo ""
    else
        read -p "    $prompt_text: " value
    fi

    if [ -z "$value" ] && [ -n "$default_value" ]; then
        value="$default_value"
    fi

    eval "$var_name='$value'"
}

# ============================================================================
# Collect Information
# ============================================================================

print_header "🚀 Auto Deploy: Next.js + Cloudflare Tunnel"

echo -e "${YELLOW}This script will set up:${NC}"
echo "  1. Node.js (if not installed)"
echo "  2. Clone & build your Next.js app"
echo "  3. Cloudflare Tunnel (cloudflared)"
echo "  4. Systemd services for auto-start"
echo ""

# --- App Config ---
print_header "📦 App Configuration"

prompt REPO_URL "Git repository URL"
prompt APP_NAME "App name (used for service names)" "subtitle-translate"
prompt APP_DIR "Install directory" "$HOME/$APP_NAME"
prompt APP_PORT "App port" "3000"

# --- Environment Variables ---
print_header "🔐 Environment Variables"

prompt GEMINI_API_KEY "GEMINI_API_KEY" "" "true"
prompt OPENROUTER_API_KEY "OPENROUTER_API_KEY (press Enter to skip)" "" "true"
prompt UPSTASH_REDIS_REST_URL "UPSTASH_REDIS_REST_URL (press Enter to skip)"
prompt UPSTASH_REDIS_REST_TOKEN "UPSTASH_REDIS_REST_TOKEN (press Enter to skip)" "" "true"
prompt DAILY_QUOTA "DAILY_QUOTA" "5"

# --- Cloudflare Tunnel ---
print_header "☁️  Cloudflare Tunnel"

print_info "You need to have logged in with: cloudflared tunnel login"
echo ""
prompt TUNNEL_NAME "Tunnel name" "$APP_NAME"
prompt HOSTNAME "Domain/subdomain (e.g. v3.translate.io.vn)"

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  Summary:${NC}"
echo "    Repo:     $REPO_URL"
echo "    App name: $APP_NAME"
echo "    Dir:      $APP_DIR"
echo "    Port:     $APP_PORT"
echo "    Hostname: $HOSTNAME"
echo "    Tunnel:   $TUNNEL_NAME"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
read -p "    Proceed? (y/N): " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "Aborted."
    exit 0
fi

# ============================================================================
# Step 1: Install Node.js
# ============================================================================

print_header "Step 1/7: Installing Node.js"

if command -v node &> /dev/null; then
    NODE_VER=$(node -v)
    print_step "Node.js already installed: $NODE_VER"
else
    print_info "Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
    sudo apt install -y nodejs
    print_step "Node.js $(node -v) installed"
fi

# ============================================================================
# Step 2: Clone & Install
# ============================================================================

print_header "Step 2/7: Cloning & Installing App"

if [ -d "$APP_DIR" ]; then
    print_warn "Directory $APP_DIR already exists"
    read -p "    Overwrite? (y/N): " OVERWRITE
    if [[ "$OVERWRITE" == "y" || "$OVERWRITE" == "Y" ]]; then
        rm -rf "$APP_DIR"
    else
        print_info "Skipping clone, using existing directory"
    fi
fi

if [ ! -d "$APP_DIR" ]; then
    git clone "$REPO_URL" "$APP_DIR"
    print_step "Cloned repository"
fi

cd "$APP_DIR"
npm install
print_step "Dependencies installed"

# ============================================================================
# Step 3: Create .env.local
# ============================================================================

print_header "Step 3/7: Creating .env.local"

cat > "$APP_DIR/.env.local" << EOF
$([ -n "$GEMINI_API_KEY" ] && echo "GEMINI_API_KEY=$GEMINI_API_KEY")
$([ -n "$OPENROUTER_API_KEY" ] && echo "OPENROUTER_API_KEY=$OPENROUTER_API_KEY")
$([ -n "$UPSTASH_REDIS_REST_URL" ] && echo "UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL")
$([ -n "$UPSTASH_REDIS_REST_TOKEN" ] && echo "UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN")
$([ -n "$DAILY_QUOTA" ] && echo "DAILY_QUOTA=$DAILY_QUOTA")
EOF

# Remove empty lines
sed -i '/^$/d' "$APP_DIR/.env.local"
print_step "Created .env.local"

# ============================================================================
# Step 4: Build App
# ============================================================================

print_header "Step 4/7: Building App"

cd "$APP_DIR"
npm run build
print_step "App built successfully"

# ============================================================================
# Step 5: Install cloudflared
# ============================================================================

print_header "Step 5/7: Setting up Cloudflare Tunnel"

if command -v cloudflared &> /dev/null; then
    print_step "cloudflared already installed: $(cloudflared --version 2>&1 | head -1)"
else
    print_info "Installing cloudflared..."
    ARCH=$(dpkg --print-architecture)
    curl -L "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}.deb" -o /tmp/cloudflared.deb
    sudo dpkg -i /tmp/cloudflared.deb
    rm /tmp/cloudflared.deb
    print_step "cloudflared installed"
fi

# Check if logged in
if [ ! -f "$HOME/.cloudflared/cert.pem" ]; then
    print_warn "Not logged in to Cloudflare. Running login..."
    cloudflared tunnel login
fi

# Create tunnel
EXISTING_TUNNEL=$(cloudflared tunnel list -o json 2>/dev/null | grep -o "\"$TUNNEL_NAME\"" || true)
if [ -n "$EXISTING_TUNNEL" ]; then
    print_warn "Tunnel '$TUNNEL_NAME' already exists"
    TUNNEL_ID=$(cloudflared tunnel list -o json | python3 -c "
import sys, json
tunnels = json.load(sys.stdin)
for t in tunnels:
    if t['name'] == '$TUNNEL_NAME':
        print(t['id'])
        break
")
    print_info "Using existing tunnel ID: $TUNNEL_ID"
else
    print_info "Creating tunnel '$TUNNEL_NAME'..."
    TUNNEL_OUTPUT=$(cloudflared tunnel create "$TUNNEL_NAME" 2>&1)
    TUNNEL_ID=$(echo "$TUNNEL_OUTPUT" | grep -oP '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}' | head -1)
    print_step "Tunnel created: $TUNNEL_ID"
fi

# ============================================================================
# Step 6: Configure Tunnel
# ============================================================================

print_header "Step 6/7: Configuring Tunnel"

CRED_FILE="$HOME/.cloudflared/${TUNNEL_ID}.json"

if [ ! -f "$CRED_FILE" ]; then
    print_error "Credentials file not found: $CRED_FILE"
    print_info "Please check ~/.cloudflared/ for the correct file"
    exit 1
fi

cat > "$HOME/.cloudflared/config.yml" << EOF
tunnel: ${TUNNEL_ID}
credentials-file: ${CRED_FILE}

ingress:
  - hostname: ${HOSTNAME}
    service: http://localhost:${APP_PORT}
  - service: http_status:404
EOF

print_step "Tunnel config created: ~/.cloudflared/config.yml"

# Route DNS
print_info "Creating DNS route..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$HOSTNAME" 2>/dev/null || print_warn "DNS route may already exist"
print_step "DNS route configured: $HOSTNAME → tunnel"

# ============================================================================
# Step 7: Systemd Services
# ============================================================================

print_header "Step 7/7: Creating Systemd Services"

CURRENT_USER=$(whoami)

# App service
sudo tee /etc/systemd/system/${APP_NAME}.service > /dev/null << EOF
[Unit]
Description=${APP_NAME} Next.js App
After=network.target

[Service]
Type=simple
User=${CURRENT_USER}
WorkingDirectory=${APP_DIR}
ExecStart=$(which npm) start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=${APP_PORT}

[Install]
WantedBy=multi-user.target
EOF

print_step "Created service: ${APP_NAME}.service"

# Cloudflared service
sudo tee /etc/systemd/system/${APP_NAME}-tunnel.service > /dev/null << EOF
[Unit]
Description=${APP_NAME} Cloudflare Tunnel
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${CURRENT_USER}
ExecStart=$(which cloudflared) tunnel run ${TUNNEL_NAME}
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

print_step "Created service: ${APP_NAME}-tunnel.service"

# Enable & start
sudo systemctl daemon-reload
sudo systemctl enable "${APP_NAME}" "${APP_NAME}-tunnel"
sudo systemctl start "${APP_NAME}" "${APP_NAME}-tunnel"

print_step "Services enabled and started"

# ============================================================================
# Done!
# ============================================================================

print_header "🎉 Deployment Complete!"

echo -e "  ${GREEN}App URL:${NC}     https://${HOSTNAME}"
echo -e "  ${GREEN}App service:${NC} sudo systemctl status ${APP_NAME}"
echo -e "  ${GREEN}Tunnel:${NC}      sudo systemctl status ${APP_NAME}-tunnel"
echo ""
echo -e "  ${BLUE}Useful commands:${NC}"
echo "    View app logs:     sudo journalctl -u ${APP_NAME} -f"
echo "    View tunnel logs:  sudo journalctl -u ${APP_NAME}-tunnel -f"
echo "    Restart app:       sudo systemctl restart ${APP_NAME}"
echo "    Update & rebuild:  cd ${APP_DIR} && git pull && npm install && npm run build && sudo systemctl restart ${APP_NAME}"
echo ""
print_warn "Make sure SSL/TLS is set to 'Full' in Cloudflare Dashboard"
print_warn "Certificate may take a few minutes to provision for new domains"
