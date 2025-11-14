<?php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\Mime\MimeTypes;
use App\GopherGetter;


class GopherController extends AbstractController
{

  #[Route('/{dest}', requirements: ['dest' => '.+'])]
  public function gopher(string $dest): Response
  {
    $result = $this->loadGopher($dest, array_key_exists('text', $_POST) ? $_POST['text'] : null);

    $breadcrumb = array();
    $snippets = explode("/", $dest);
    $base = "";
    array_push($breadcrumb, array('href' => "/", 'value' => "Home"));

    foreach ($snippets as $frag) {
      $base = $base . "/" . $frag;
      array_push($breadcrumb, array('href' => $base, 'value' => $frag));
    }

    if (array_key_exists('file', $result)) {
      $mimeTypes = new MimeTypes();
      $mimeType = $mimeTypes->guessMimeType($result['file']);

      if (str_starts_with($mimeType, "image/")) {
        return $this->render('layout.html.twig', [
          'title' => getenv("GOPHER_TITLE"),
          'subtitle' => getenv("GOPHER_SUBTITLE"),
          'about_path' => getenv("GOPHER_ABOUT_URL"),
          'description' => getenv("GOPHER_DESCRIPTION"),
          'date' => date("Y"),
          'image' => base64_encode(file_get_contents($result['file'])),
          'content-type' => $mimeType,
          'breadcrumb' => $breadcrumb
        ]);
    
      } else {
        $response = new BinaryFileResponse($result['file']);
        $response->setContentDisposition(
          ResponseHeaderBag::DISPOSITION_ATTACHMENT,
          $result['filename']
        );  
      }

      return $response;
    }

    return $this->render('layout.html.twig', [
      'title' => getenv("GOPHER_TITLE"),
      'subtitle' => getenv("GOPHER_SUBTITLE"),
      'about_path' => getenv("GOPHER_ABOUT_URL"),
      'description' => getenv("GOPHER_DESCRIPTION"),
      'date' => date("Y"),
      'data' => $result['data'],
      'breadcrumb' => $breadcrumb
    ]);
  }

  #[Route('/')]
  public function landing(): Response
  {

    $opts = array(
      'title' => getenv("GOPHER_TITLE"),
      'subtitle' => getenv("GOPHER_SUBTITLE"),
      'about_path' => getenv("GOPHER_ABOUT_URL"),
      'description' => getenv("GOPHER_DESCRIPTION"),
      'date' => date("Y")
    );

    if ( getenv('START_REQUEST') !== FALSE ) {
      $opts['data'] = $this->loadGopher(getenv('START_REQUEST'), getenv('START_INPUT'))['data'];
    }
    else {
      $opts['intro'] = file_get_contents(dirname(".") . "/../templates/intro.html");
    }
    
    return $this->render('layout.html.twig', $opts);
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
        else if ( $x->isBinary() ) {
          $result['file'] = $x->urlFor();
          $result['image'] = $x->isImage();
          $parts = parse_url($url);
          $result['filename'] = basename($parts['path']);
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
