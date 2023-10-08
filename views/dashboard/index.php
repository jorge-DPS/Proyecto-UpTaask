<?php include_once __DIR__ . '/header-dashboard.php'; ?>


<?php if (count($proyectos) === 0) : ?>
    <p class="no-proyectos">No hay proyectos que mostrar <a href="/crear-proyecto">Comienza creando uno</a></p>
<?php else : ?>
    <ul class="listado-proyectos">
        <?php foreach ($proyectos as $proyecto) : ?>
            <a href="/proyecto?url=<?php echo $proyecto->url; ?>">
                <li class="proyecto">
                    <?php echo $proyecto->proyecto; ?>
                </li>
            </a>
        <?php endforeach; ?>
    </ul>
<?php endif; ?>


<?php include_once __DIR__ . '/footer-dashboard.php'; ?>