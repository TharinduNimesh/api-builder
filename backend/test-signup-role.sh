#!/bin/bash
# Test script for signup and default role functionality
# Prerequisites: Backend running on port 3000, database migrated

BASE_URL="http://localhost:3000"
COOKIE_FILE="/tmp/test_cookies.txt"

echo "========================================="
echo "Signup & Default Role Integration Test"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✓ PASS${NC}: $2"
  else
    echo -e "${RED}✗ FAIL${NC}: $2"
  fi
}

# Test 1: Get current project settings
echo "Test 1: Fetch project settings"
RESPONSE=$(curl -s -X GET "$BASE_URL/api/project")
echo "$RESPONSE" | jq '.'
SIGNUP_ENABLED=$(echo "$RESPONSE" | jq -r '.project.signup_enabled // false')
DEFAULT_ROLE=$(echo "$RESPONSE" | jq -r '.project.default_role // "null"')
echo -e "${YELLOW}Current settings:${NC} signup_enabled=$SIGNUP_ENABLED, default_role=$DEFAULT_ROLE"
echo ""

# Test 2: Sign up as builder user (to get auth token)
echo "Test 2: Sign up as API builder user"
BUILDER_EMAIL="builder_$(date +%s)@test.com"
BUILDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"Builder\",\"lastName\":\"User\",\"email\":\"$BUILDER_EMAIL\",\"password\":\"Password123\"}")
  
BUILDER_TOKEN=$(echo "$BUILDER_RESPONSE" | jq -r '.accessToken')
if [ "$BUILDER_TOKEN" != "null" ] && [ -n "$BUILDER_TOKEN" ]; then
  test_result 0 "Builder user created successfully"
else
  test_result 1 "Failed to create builder user"
  echo "$BUILDER_RESPONSE" | jq '.'
  exit 1
fi
echo ""

# Test 3: Create project with signup enabled and default role
echo "Test 3: Create project with signup enabled and default role 'user'"
PROJECT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/project" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUILDER_TOKEN" \
  -d '{
    "name": "Test Project",
    "enable_roles": true,
    "roles": [
      {"name": "admin", "description": "Administrator"},
      {"name": "user", "description": "Regular user"}
    ],
    "signup_enabled": true,
    "default_role": "user"
  }' 2>&1)

if echo "$PROJECT_RESPONSE" | jq -e '.project.id' > /dev/null 2>&1; then
  test_result 0 "Project created with signup settings"
  echo "$PROJECT_RESPONSE" | jq '.project | {signup_enabled, default_role, enable_roles}'
else
  # Project might already exist - try to update settings instead
  echo -e "${YELLOW}Note:${NC} Project may already exist, trying settings update..."
  
  SETTINGS_UPDATE=$(curl -s -X PUT "$BASE_URL/api/settings/roles" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $BUILDER_TOKEN" \
    -d '{
      "roles": [
        {"name": "admin", "description": "Administrator"},
        {"name": "user", "description": "Regular user"}
      ],
      "enable_roles": true,
      "signup_enabled": true,
      "default_role": "user"
    }')
    
  if echo "$SETTINGS_UPDATE" | jq -e '.project' > /dev/null 2>&1; then
    test_result 0 "Settings updated with signup enabled and default role"
  else
    test_result 1 "Failed to create/update project"
    echo "$PROJECT_RESPONSE"
  fi
fi
echo ""

# Test 4: Sign up app user and verify default role is assigned
echo "Test 4: Sign up app user with default role assignment"
APP_USER_EMAIL="appuser_$(date +%s)@test.com"
APP_USER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/b/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"firstName\":\"App\",\"lastName\":\"User\",\"email\":\"$APP_USER_EMAIL\",\"password\":\"Password1\"}")

APP_USER_ROLES=$(echo "$APP_USER_RESPONSE" | jq -r '.user.roles // []')
echo "$APP_USER_RESPONSE" | jq '.user'

if echo "$APP_USER_ROLES" | jq -e '. | length > 0' > /dev/null 2>&1 && \
   echo "$APP_USER_ROLES" | jq -e '.[] | select(. == "user")' > /dev/null 2>&1; then
  test_result 0 "App user assigned default role 'user'"
else
  test_result 1 "App user was not assigned default role"
fi
echo ""

# Test 5: Disable signup and test role assignment
echo "Test 5: Disable signup and verify no role assigned"
DISABLE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/settings/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUILDER_TOKEN" \
  -d '{
    "roles": [
      {"name": "admin", "description": "Administrator"},
      {"name": "user", "description": "Regular user"}
    ],
    "enable_roles": true,
    "signup_enabled": false,
    "default_role": "user"
  }')

if echo "$DISABLE_RESPONSE" | jq -e '.project' > /dev/null 2>&1; then
  echo -e "${YELLOW}Signup disabled${NC}"
  
  # Try signing up another user
  APP_USER_EMAIL2="appuser2_$(date +%s)@test.com"
  APP_USER_RESPONSE2=$(curl -s -X POST "$BASE_URL/api/b/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"firstName\":\"App2\",\"lastName\":\"User2\",\"email\":\"$APP_USER_EMAIL2\",\"password\":\"Password1\"}")
  
  APP_USER_ROLES2=$(echo "$APP_USER_RESPONSE2" | jq -r '.user.roles // []')
  
  if [ "$APP_USER_ROLES2" == "[]" ] || [ "$APP_USER_ROLES2" == "null" ]; then
    test_result 0 "App user not assigned role when signup disabled"
  else
    test_result 1 "App user incorrectly assigned role when signup disabled"
    echo "$APP_USER_RESPONSE2" | jq '.user.roles'
  fi
else
  test_result 1 "Failed to disable signup"
fi
echo ""

# Test 6: Clear default role and verify no role assigned
echo "Test 6: Clear default role and verify no role assigned"
CLEAR_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/settings/roles" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BUILDER_TOKEN" \
  -d '{
    "roles": [
      {"name": "admin", "description": "Administrator"},
      {"name": "user", "description": "Regular user"}
    ],
    "enable_roles": true,
    "signup_enabled": true,
    "default_role": null
  }')

if echo "$CLEAR_RESPONSE" | jq -e '.project' > /dev/null 2>&1; then
  echo -e "${YELLOW}Default role cleared${NC}"
  
  # Try signing up another user
  APP_USER_EMAIL3="appuser3_$(date +%s)@test.com"
  APP_USER_RESPONSE3=$(curl -s -X POST "$BASE_URL/api/b/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{\"firstName\":\"App3\",\"lastName\":\"User3\",\"email\":\"$APP_USER_EMAIL3\",\"password\":\"Password1\"}")
  
  APP_USER_ROLES3=$(echo "$APP_USER_RESPONSE3" | jq -r '.user.roles // []')
  
  if [ "$APP_USER_ROLES3" == "[]" ] || [ "$APP_USER_ROLES3" == "null" ]; then
    test_result 0 "App user not assigned role when default_role is empty"
  else
    test_result 1 "App user incorrectly assigned role when default_role is empty"
    echo "$APP_USER_RESPONSE3" | jq '.user.roles'
  fi
else
  test_result 1 "Failed to clear default role"
fi
echo ""

echo "========================================="
echo "Test Suite Complete"
echo "========================================="
