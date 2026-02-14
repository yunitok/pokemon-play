export const fadeOutAndSwitch = (scene, targetSceneKey, duration = 500) => {
    if (!scene || !scene.cameras || !scene.cameras.main) {
        console.warn('fadeOutAndSwitch: Invalid scene');
        scene.scene.start(targetSceneKey);
        return;
    }

    // Disable input to prevent double clicks during transition
    scene.input.enabled = false;

    // Play transition sound (re-using click/UI sound for now)
    // Dynamic import to avoid circular dependency if transition is used in Managers? 
    // Ideally AudioManager is a Singleton we can import.
    import('../managers/AudioManager').then(({ audioManager }) => {
        audioManager.playUiSound();
    });

    scene.cameras.main.fadeOut(duration, 0, 0, 0);
    scene.cameras.main.once('camerafadeoutcomplete', () => {
        scene.scene.start(targetSceneKey);
    });
};
