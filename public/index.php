<?php

use App\Kernel;

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

error_reporting(E_ERROR | E_PARSE);

return function (array $context) {
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
