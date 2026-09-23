<?php

require __DIR__.'/../vendor/autoload.php';

try {
    $yaml = Symfony\Component\Yaml\Yaml::parseFile(__DIR__.'/../public/openapi.yaml');
    echo 'YAML OK - paths: '.count($yaml['paths']).PHP_EOL;
} catch (Throwable $e) {
    echo 'YAML ERROR: '.$e->getMessage().PHP_EOL;
    exit(1);
}