export const fadeOutAndSwitch = (scene, targetSceneKey, duration = 500) => {
    if (!scene || !scene.cameras || !scene.cameras.main) {
        console.warn('fadeOutAndSwitch: Invalid scene');
        scene.scene.start(targetSceneKey);
        return;
    }

    // Disable input to prevent double clicks during transition
    scene.input.enabled = false;

    scene.cameras.main.fadeOut(duration, 0, 0, 0);
    scene.cameras.main.once('camerafadeoutcomplete', () => {
        scene.scene.start(targetSceneKey);
    });
};
