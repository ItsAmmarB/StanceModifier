let started = false;

onNet('StanceModifier:Started', () => started = true);

setTimeout(() => {
    if (started) {
        console.info('==========[Stance Modifier]==========')
        console.info('Stance Modifier Started Successfully!')
        console.info('Author: Ammar B.')
        console.info('Credits: TimothyDexter & JediJosh920')
        console.info('==========[Stance Modifier]==========')
    } else {
        console.error('==========[Stance Modifier]==========')
        console.error('Stance Modifier Didn\'t Start!')
        console.error('Author: Ammar B.')
        console.error('Credits: TimothyDexter & JediJosh920')
        console.error('==========[Stance Modifier]==========')
    }
}, 15000);
