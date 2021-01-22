echo
echo Pulling changes from Git (master)...
git pull origin main\
&& echo 'Done'\
|| echo 'Failed'

echo
echo Updating npm packages...
npm i\
&& echo 'Done'\
|| echo 'Failed'

echo
echo Bot has been updated!
exit 0