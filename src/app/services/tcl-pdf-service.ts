import { Injectable } from '@angular/core';
import type { Color, PDFPage, PDFFont } from 'pdf-lib';
import { TclData } from '../models/tcl.model';

@Injectable({
  providedIn: 'root'
})
export class TclPdfService {

  async exportar(data: TclData): Promise<void> {
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    // 1. Cargar la plantilla PDF del TCL.
    const response = await fetch(
      '/TCL.pdf'
    );

    if (!response.ok) {
      throw new Error('No se pudo cargar la plantilla del TCL.');
    }

    const templateBytes = await response.arrayBuffer();

    // 2. Abrir el PDF original.
    const pdfDoc = await PDFDocument.load(templateBytes);

    // 3. Obtener la primera página.
    const page = pdfDoc.getPages()[0];

    if (!page) {
      throw new Error('La plantilla no contiene páginas.');
    }

    // 4. Cargar la fuente.
    const font = await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

    const altoPagina = page.getSize().height;

    // 5. Función auxiliar para escribir campos simples.
    // Las coordenadas se indican desde arriba.
    const escribir = (
      texto: string | undefined,
      x: number,
      top: number,
      tamano = 9,
      anchoMaximo = 240
    ): void => {

      if (!texto?.trim()) {
        return;
      }

      page.drawText(texto, {
        x,
        y: altoPagina - top - tamano,
        size: tamano,
        font,
        color: rgb(0, 0, 0),
        maxWidth: anchoMaximo
      });
    };

    // 6. Escribir los datos del destinatario.
    // IMPORTANTE: ajustar las coordenadas a tu plantilla real.
    escribir(data.destinatario, 32, 103, 9, 245);
    escribir(data.actividad, 32, 132, 9, 245);
    escribir(data.domicilioLaboral, 32, 161, 9, 175);
    escribir(data.codigoPostalDestinatario, 212, 161, 9, 60);
    escribir(data.localidadDestinatario, 32, 190, 9, 160);
    escribir(data.provinciaDestinatario, 212, 190, 9, 100);

    // 7. Escribir los datos del remitente.
    escribir(data.remitente, 311, 103, 9, 240);
    escribir(data.dni, 311, 132, 9, 90);
    escribir(data.fecha, 498, 132, 9, 60);
    escribir(data.domicilioReal, 311, 161, 9, 175);
    escribir(data.codigoPostalRemitente, 498, 161, 9, 60);
    escribir(data.localidadRemitente, 311, 190, 9, 150);
    escribir(data.provinciaRemitente, 498, 190, 9, 60);

    // 8. Escribir el mensaje del TCL dentro de su recuadro.
    this.escribirTextoEnCaja(
      page,
      data.mensaje,
      font,
      rgb(0, 0, 0),
      {
        x: 32,       // Posición horizontal del recuadro.
        top: 253,    // Distancia desde arriba hasta el recuadro.
        width: 530,  // Ancho total del recuadro.
        height: 200  // Alto total del recuadro.
      },
      10, // Tamaño inicial de fuente.
      8   // Tamaño mínimo de fuente.
    );

    // 9. Guardar el PDF generado.
    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = new Uint8Array(pdfBytes);

    // 10. Preparar la descarga.
    const blob = new Blob([pdfBuffer], {
      type: 'application/pdf'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'TCL-borrador.pdf';

    document.body.appendChild(link);
    link.click();
    link.remove();

    // 11. Liberar la URL temporal.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }


  /**
   * Escribe el texto dentro de una caja con ancho y alto limitados.
   * Ajusta las palabras a nuevas líneas y reduce la fuente
   * si es necesario. Si el texto no entra, lanza un error.
   */
  private escribirTextoEnCaja(
    page: PDFPage,
    texto: string,
    font: PDFFont,
    color: Color,
    caja: {
      x: number;
      top: number;
      width: number;
      height: number;
    },
    tamanoInicial = 10,
    tamanoMinimo = 8
  ): void {

    if (!texto?.trim()) {
      return;
    }

    const altoPagina = page.getSize().height;

    // Margen interno para que el texto no toque los bordes.
    const padding = 4;

    const anchoDisponible = caja.width - padding * 2;
    const altoDisponible = caja.height - padding * 2;

    if (anchoDisponible <= 0 || altoDisponible <= 0) {
      throw new Error('Las dimensiones del recuadro no son válidas.');
    }

    // Normalizar saltos de línea.
    const textoNormalizado = texto
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');

    // Devuelve las líneas que entran horizontalmente.
    const ajustarLineas = (tamano: number): string[] => {

      const lineas: string[] = [];

      // Respetar los saltos de línea del usuario.
      const parrafos = textoNormalizado.split('\n');

      for (const parrafo of parrafos) {

        // Mantener los párrafos vacíos como líneas vacías.
        if (!parrafo.trim()) {
          lineas.push('');
          continue;
        }

        const palabras = parrafo.trim().split(/\s+/);

        let lineaActual = '';

        for (const palabra of palabras) {

          // Si una palabra sola supera el ancho disponible,
          // dividirla carácter por carácter.
          if (
            font.widthOfTextAtSize(palabra, tamano) >
            anchoDisponible
          ) {

            if (lineaActual) {
              lineas.push(lineaActual);
              lineaActual = '';
            }

            let fragmento = '';

            for (const caracter of Array.from(palabra)) {

              const candidato = fragmento + caracter;

              if (
                fragmento &&
                font.widthOfTextAtSize(candidato, tamano) >
                anchoDisponible
              ) {
                lineas.push(fragmento);
                fragmento = caracter;
              } else {
                fragmento = candidato;
              }
            }

            lineaActual = fragmento;
            continue;
          }

          // Intentar agregar la palabra a la línea actual.
          const candidata = lineaActual
            ? `${lineaActual} ${palabra}`
            : palabra;

          const anchoCandidata = font.widthOfTextAtSize(
            candidata,
            tamano
          );

          if (anchoCandidata <= anchoDisponible) {
            lineaActual = candidata;
          } else {
            if (lineaActual) {
              lineas.push(lineaActual);
            }

            lineaActual = palabra;
          }
        }

        if (lineaActual) {
          lineas.push(lineaActual);
        }
      }

      return lineas;
    };

    // Probar tamaños de fuente hasta que todas las líneas entren.
    let resultado: {
      lineas: string[];
      tamano: number;
      altoLinea: number;
    } | null = null;

    for (
      let tamano = tamanoInicial;
      tamano >= tamanoMinimo - 0.0001;
      tamano = Math.round((tamano - 0.25) * 100) / 100
    ) {

      const lineas = ajustarLineas(tamano);

      // Separación vertical entre las líneas.
      const altoLinea = tamano * 1.2;

      // Comprobar si el texto entra también verticalmente.
      const alturaNecesaria = lineas.length * altoLinea;

      if (alturaNecesaria <= altoDisponible) {
        resultado = {
          lineas,
          tamano,
          altoLinea
        };

        break;
      }
    }

    // No escribir ni recortar silenciosamente el contenido.
    if (!resultado) {
      throw new Error(
        'El texto supera el espacio disponible en el TCL. ' +
        'Reducí su extensión o seleccioná el formulario adecuado.'
      );
    }

    // Dibujar las líneas dentro del recuadro.
    resultado.lineas.forEach((linea, indice) => {

      if (!linea) {
        return;
      }

      // Posición vertical de la línea, medida desde arriba.
      const distanciaDesdeArriba =
        caja.top +
        padding +
        resultado!.tamano +
        indice * resultado!.altoLinea;

      // pdf-lib mide Y desde la parte inferior de la página.
      const y = altoPagina - distanciaDesdeArriba;

      page.drawText(linea, {
        x: caja.x + padding,
        y,
        size: resultado!.tamano,
        font,
        color
      });
    });
  }
}
