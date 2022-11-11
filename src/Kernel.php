<?php

namespace App;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    public function getLogDir(): string
    {
        // return dirname(__DIR__).'/var/'.$this->environment.'/log';
        return '/tmp';
    }
}


