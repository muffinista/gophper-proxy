<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;

use App\GopherGetter;


class GopherController extends AbstractController
{

  #[Route('/{dest}', requirements: ['dest' => '.+'])]
  public function gopher(string $dest): Response
  {
    $result = $this->loadGopher($dest, $_POST['text']);

    return $this->render('layout.html.twig', [
      'title' => getenv("GOPHER_TITLE"),
      'about_path' => getenv("GOPHER_ABOUT_URL"),
      'description' => getenv("GOPHER_DESCRIPTION"),
      'date' => date("Y"),
      'data' => $result['data']
    ]);
  }

  #[Route('/')]
  public function landing(): Response
  {
      $number = random_int(0, 100);

      return $this->render('layout.html.twig', [
        'title' => getenv("GOPHER_TITLE"),
        'about_path' => getenv("GOPHER_ABOUT_URL"),
        'description' => getenv("GOPHER_DESCRIPTION"),
        'date' => date("Y"),
        'data' => $number
      ]);
  }

    
  private function loadGopher(string $url, $input): array {
    $result = array();
    $x = new GopherGetter($url, $input);

    if ( $x->isValid() ) {
        $success = $x->get();

        if ( $success == FALSE ) {
            $result['url'] = $url;
            $result['data'] = "3Sorry, there was a problem with your request - " . $x->errstr . "\t\tNULL\t70";
        }
        // send binary files and large text back as an attachment
        else if ( $x->isBinary() || $x->size() > 1000000 ) {
            $result['url'] = "/file?name=" . basename($url) . "&path=" . $x->urlFor();
            $result['image'] = $x->isImage();
        }
        else {
            $result['url'] = $url;
            $result['data'] = $x->result;
            if (!mb_check_encoding($result['data'], 'UTF-8')) {
                $result['data'] = utf8_encode($result['data']);
            }
        }
    }
    else {
        $result['url'] = $url;
        $result['data'] = "3Sorry, there was a problem with your request\t\tNULL\t70";
    }

    return $result;
  }
}
