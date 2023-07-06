ENV_FILE=".env"
YELLOW=$(tput setaf 3)
RESET=$(tput sgr0)

env_vars_setup() {

  # Check if the env file exists
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "Creating test env vars..."
    touch "$ENV_FILE"
    echo "DATABASE_URL='postgresql://fudy_user:fudy_password@localhost:5432/fudy_db'" >> "$ENV_FILE"
    echo "SECRET_KEY='Fudy!challenge;api:nest[prisma]postgres'" >> "$ENV_FILE"
    echo "TOKEN_EXPIRATION_TIME='7d'" >> "$ENV_FILE"

    echo "${YELLOW}WARNING: REMEMBER THESE ENV VARS ARE FOR TEST PURPOSES AND NOT FOR PRODUCTION USE${RESET}"
    else
    echo "Env file already exists. Skipping env vars setup."
  fi
}

env_vars_setup