cd $1
for target in `ls`
do
    cd ${target}
    echo `pwd`
    count=0;
    for f in `ls *.wav`
    do
        ((count=${count} + 1)) 
        `mv $f "${count}.wav"`
    done
    cd ../
done
