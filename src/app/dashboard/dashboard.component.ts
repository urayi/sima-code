import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { UploadDataService } from '../services/upload-data.service';
declare var Blockly: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  btnJugar = 'Jugar';
  workspacePlayground: any;

  public toolbox = `<xml id="toolbox" style="display: none;">
    <category name="Movimientos" colour="#6d5ba5">
      <block type="start"></block>
      <block type="move">
        <field name="direction">Forward</field>
        <value name="steps">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
      <block type="salute"></block>
      <block type="dance"></block>
    </category>
    <sep></sep>
    <category name="Matemática" colour="#5C68A6">
      <block type="math_number">
        <field name="NUM">0</field>
      </block
      >
      <block type="math_arithmetic">
        <field name="OP">ADD</field>
        <value name="A">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="B">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
      </block>
      <block type="math_random_int">
        <value name="FROM">
          <shadow type="math_number">
            <field name="NUM">1</field>
          </shadow>
        </value>
        <value name="TO">
          <shadow type="math_number">
            <field name="NUM">100</field>
          </shadow>
        </value>
      </block>
    </category>
    <sep></sep>
    <category name="Ciclos" colour="#5CA65C">
      <block type="controls_repeat_ext">
        <value name="TIMES">
          <shadow type="math_number">
            <field name="NUM">10</field>
          </shadow>
        </value>
      </block>
    </category>
  </xml>`;

  xml = new XMLHttpRequest();
  constructor(private dataService: UploadDataService) { }

  ngOnInit() {

    this.createBlocks();

    this.xml.open('GET', 'assets/blockly/blocks.xml', false);
    this.xml.send();
    const xmlFinal = this.xml.responseXML;
    console.log(xmlFinal);

  }


  createBlocks() {

    this.workspacePlayground = Blockly.inject('blocklyDiv', { toolbox: this.toolbox });
    // return workspacePlayground;

  }

  ejecutar() {

    this.btnJugar = 'Procesando...';
    Blockly.JavaScript.addReservedWords('code');
    const code = Blockly.JavaScript.workspaceToCode(this.workspacePlayground);
    const codex = eval(code);
    const today = new Date();
    const date = moment(today.getTime()).format('YYYY-MM-DD HH:mm:ss');
    const token = localStorage.getItem('token');
    const tokenParse = this.parseJwt(token);
    const mac = tokenParse.data.user.id;

    console.log(code);

    const body = {
      orden: codex || '',
      fecha: date,
      mac: mac
    };

    console.log(body, tokenParse.data.user.id);

    this.dataService.uploadData(body).subscribe(
      res => {
        if (res.success) {
          console.log(res.message);
          this.btnJugar = 'Hecho';
          setTimeout(() => {
            alert('Dile a SIMA la palabra "REMOTO", para que realice tu programa');
            this.btnJugar = 'Jugar';
          }, 1000);
        }
      },
      error => {
        console.log(error);
        alert('Opsss... parece que hubo un problema en la casa de sima');
      }
    );

  }

  parseJwt(jwt) {
    const base64Url = jwt.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  };
}
