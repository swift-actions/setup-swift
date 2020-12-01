#!/bin/sh
latest_release_name=`hub api repos/apple/swift/releases/latest | jq '.name'`
exp="[0-9\.]"
re="Swift ([0-9\.]+)"
if [[ "$latest_release_name" =~ "$re" ]]
then 
  latest_release_number=${BASH_REMATCH[1]}
else
  echo "No release found"
  exit 0
fi

echo "Latest release is $latest_release_number"

if grep -q "$latest_release_number" "./src/swift-versions.ts"
then
  echo "Version already added"
  exit 0
fi

if hub issue | grep "Add Swift $latest_release_number"
then
  echo "Issue already created"
  exit 0
fi

hub issue create -m "Add Swift $latest_release_number" -m "Swift $latest_release_number have been released and should be added" -a "fwal" -l "enhancement"
echo "Issue created"
