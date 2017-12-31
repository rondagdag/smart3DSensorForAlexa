rm index.zip
zip -Xr index.zip node_modules
cd Alexa
zip -ur ../index.zip *
echo "Zipped"
cd ..
aws lambda update-function-code --function-name Smart3DSensorSkill --zip-file fileb://index.zip
