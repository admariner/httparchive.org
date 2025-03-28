#!/bin/bash

######################################
## Custom Web Almanac script        ##
######################################
#
# Run the GitHub Super-Linter locally
# useful to avoid waiting on the push to get feed back
#
# It can be run to lint everthing if no params are passed
# Or pass one or more params to just lint those files or folders
#
# Note this script should only be called from the super-linter Docker container and not directly
#

# exit when any command fails instead of trying to continue on
set -e

# Annoyingly super-linter includes node_modules and env which take a long time
# https://github.com/super-linter/super-linter/issues/985
# So let's copy to /tmp folder and lint from there. It has the added advantage
# of us being able to lint specific subsets of files easily.

# Remove old files if they exist
rm -rf /tmp/lint
mkdir /tmp/lint/

echo "Copying files to /tmp"
# Check if provided files on command line or linting all files
if [ "$#" -gt 0 ]; then
  # Copy linter config files
  mkdir /tmp/lint/.github
  cp -r .github/linters /tmp/lint/.github
  # Copy files provided
  for FILES in "$@"
  do
    echo "- Copying ${FILES}"
    cp -r "${FILES}" "/tmp/lint/"
  done
else
  echo "Copying all files"
  # Copy everything except node_folders and env
  cp -r .github /tmp/lint
  find ./ -maxdepth 1 -not -name "." -not -name "node_modules" -not -name "env"  -not -name ".venv" -exec cp -r {} /tmp/lint/ \;
fi

# set all the necessary environments variables
export RUN_LOCAL=true
export VALIDATE_BASH=true
export FILTER_REGEX_EXCLUDE=".*\.min\..*"
export VALIDATE_CSS=true
export VALIDATE_HTML=true
export VALIDATE_JAVASCRIPT_ES=true
export VALIDATE_JSON=true
export VALIDATE_MARKDOWN=true
export VALIDATE_PYTHON_PYLINT=true
export VALIDATE_PYTHON_FLAKE8=true
export VALIDATE_YAML=true

echo "Starting linting"
/action/lib/linter.sh "$@"
