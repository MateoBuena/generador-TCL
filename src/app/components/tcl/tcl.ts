import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TclPdfService } from '../../services/tcl-pdf-service';
import { TclData } from '../../models/tcl.model';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'TCL',
  styleUrl: './tcl.css',
  templateUrl: './tcl.html',
})
export class TCL {

  private tclPdfService = inject(TclPdfService);

  exportando = false;
  errorPdf = '';

  private _formBuilder = inject(FormBuilder);

  tclFormGroup = this._formBuilder.group({
    destinatario: ['', Validators.required],
    actividad: ['', Validators.required],
    domicilioLaboral: ['', Validators.required],
    codigoPostalDestinatario: ['', Validators.required],
    localidadDestinatario: ['', Validators.required],
    provinciaDestinatario: ['', Validators.required],
    remitente: ['', Validators.required],
    dni: ['', Validators.required],
    fecha: ['', Validators.required],
    domicilioReal: ['', Validators.required],
    codigoPostalRemitente: ['', Validators.required],
    localidadRemitente: ['', Validators.required],
    provinciaRemitente: ['', Validators.required],
    mensaje: ['', Validators.required]
  });

  hasError(field:string, typeError:string){
    return this.tclFormGroup?.get(field)?.hasError(typeError) && this.tclFormGroup?.get(field)?.touched;
  }

  

  async exportarPdf(): Promise<void> {

    // 1. No exportar si hay campos inválidos.
    if (this.tclFormGroup?.invalid) {
      this.tclFormGroup?.markAllAsTouched();
      return;
    }

    this.exportando = true;
    this.errorPdf = '';

    try {
      // 2. Obtener los datos del formulario.
      const datos = this.tclFormGroup?.getRawValue() as TclData;

      // 3. Solicitar al servicio que cree y descargue el PDF.
      await this.tclPdfService.exportar(datos);

    } catch (error) {
      console.error(error);
      this.errorPdf = 'No se pudo generar el PDF.';
    } finally {
      this.exportando = false;
    }
  }

}
