soundName=${1}
newFileName="dc-${soundName}.html"
cp dc-master.html $1/${newFileName}
cd $1
html=`cat ${newFileName}`
html=`sed -e "s/_sound_name_/${soundName}/g" ${newFileName}`
echo ${html} >${newFileName}
