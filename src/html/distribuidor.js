var title = "Distribuidor de Disciplinas 0.01";

var atribuicao = {};
var trava = {};
var popularidade = {};

// Variáveis que devem ser carregadas a partir
// do arquivo de dados
var formularios = null;
var docentes = null;
var disciplinas = null;
var saldos = null;

function inicializa_pagina() {
    document.ti
    tle = title;

    var s_doc = document.getElementById( "selec_docente" );
    s_doc.addEventListener( "change", altera_filtro );
    s_doc.addEventListener( "click", altera_filtro );

    // var s_modo = document.createElement( "input" );
    // s_modo.setAttribute( "type", "radio" );
    // s_modo.id = "modo_listagem";

    // var s_label = document.createElement( "label" );
    // s_label.innerHTML = "todas";
    // s_label.setAttribute( "for", "modo_listagem" );

    // var cabeca = document.getElementById( "cabecalho" );
    // cabeca.appendChild( s_modo );
    // cabeca.appendChild( s_label );
}

function altera_filtro() {
    atualiza_lista_disciplinas();
}

function carrega() {
    var arqinput = document.getElementById( "nomearq" );

    var fr = new FileReader();
    fr.onload = function (){
        var text = fr.result;

        var tmp = JSON.parse( text );
        disciplinas = tmp[ 'disciplinas' ];
        docentes = tmp[ 'docentes' ];
        formularios = tmp[ 'formularios' ];
        saldos = tmp[ 'saldos' ];

        for ( var d in disciplinas ) {
            atribuicao[ d ] = [];
            trava[ d ] = false;
        }

        atualiza_seletores();
        cria_escolhedores();

        for ( var d in disciplinas ) {
            var pop = 0.0;
            for ( var doc in disciplinas[ d ][ 'escolhedores' ] ) {
                pop += 1.0 / formularios[ disciplinas[ d ][ 'escolhedores' ][ doc ][ 1 ] ][ d ][ 'prioridade' ];
            }
            popularidade[ d ] = pop;
        }

        atualiza_lista_disciplinas();

    };
    fr.readAsText( arqinput.files[ 0 ] );
}

function prio_comp( x, y ) {
    if ( x[ 0 ] < y[ 0 ] ) {
        return -1;
    } else if ( x[ 0 ] > y[ 0 ] ) {
        return 1;
    }
    return 0;
}

function cria_escolhedores() {
    for ( var disc in disciplinas ) {
        disciplinas[ disc ][ 'escolhedores' ] = [];
    }
    for ( var doc in formularios ) {
        for ( var disc in formularios[ doc ] ) {
            disciplinas[ disc ][ 'escolhedores' ].push( [ formularios[ doc ][ disc ][ 'prioridade' ], doc ] );
        }
    }
    for ( var disc in disciplinas ) {
        disciplinas[ disc ][ 'escolhedores' ].sort( prio_comp );
    }
}

function atualiza_seletores() {
    var doc_sel = document.getElementById( "selec_docente" );

    var d_opt = document.createElement( "option" );
    d_opt.innerHTML = '';
    doc_sel.appendChild( d_opt );

    for ( d in docentes ) {
        var d_opt = document.createElement( "option" );
        d_opt.innerHTML = docentes[ d ];
        doc_sel.appendChild( d_opt );
    }
}

function adiciona_docente( e ) {
    var doc = document.getElementById( "selec_docente" ).value;
    var disc = e.target.id.slice( 0, 9 );

    if ( doc == "" ) {
        trava[ disc ] = !trava[ disc ];
    }
    else if ( atribuicao[ disc ].includes( doc ) ) {
        atribuicao[ disc ].splice( atribuicao[ disc ].indexOf( doc ), 1 );
    }
    else {
        atribuicao[ disc ].push( doc );
        atribuicao[ disc ].sort();
    }

    atualiza_atribuicao( disc );
}

const nao_atrib = 1.0e7;
const horario_inter = 1.0e8;

function atrib_eval( atrib ) {
    // Quanto menor, melhor

    var retval = 0.0;

    // Esta parte tenta obrigar a atribuir todas e de forma
    // a satisfazer as escolhas dos docentes
    for ( d in atrib ) {
        if ( !trava[ d ] ) {
            if ( atrib[ d ].length == 0 ) {
                retval += nao_atrib;
            }
            else {
                if ( d in formularios[ atrib[ d ][ 0 ] ] ) {
                    retval += 2 ** formularios[ atrib[ d ][ 0 ] ][ d ][ 'prioridade' ];
                }
                else {
                    retval += nao_atrib / 3.0;
                }
            }
        }
    }

    // // Aqui tentamos limitar o número de disciplinas por docente
    // for ( var dis in atrib ) {
    //     for ( var doc in atrib[ dis ] ) {
    //         console.log( atrib[ dis ][ doc ] );
    //     }
    // }

    return retval;
}

// Conta disciplinas atribuídas a um docente:
function ndis_doc( doc, atrib ) {
    var retval = 0;
    for ( var dis in atrib ) {
        if ( atrib[ dis ].includes( doc ) ) {
            retval += 1;
        }
    }

    return retval;
}

// Cria uma vizinhanca de uma atribuição:
function vizinhanca( atrib ) {
    var retval = [];

    for ( var dis in disciplinas ) {
        if ( !trava[ dis ] ) {
            for ( var doc_idx in docentes ) {
                if ( ndis_doc( docentes[ doc_idx ], atrib ) < 2 ){
                    if ( atrib[ dis ] != [ docentes[ doc_idx ] ] ) {
                        var atrib_nova = {...atrib};
                        atrib_nova[ dis ] = [ docentes[ doc_idx ] ];
                        retval.push( atrib_nova );
                    }
                }
            }
        }
    }

    return retval;
}

function check_attrib( atrib ) {
    for ( d in atrib ) {
        if ( atrib[ d ].length == 0 ) {
            return false;
        }
    }

    return true;
}

function proxima( atrib ) {
    var v = vizinhanca( atrib );

    var mn = Infinity;
    var i_mn = 0;

    for ( var i in v ) {
        var fv = atrib_eval( v[ i ] );
        mn = ( fv < mn ) ? fv : mn;
        i_mn = ( fv == mn ) ? i : i_mn; 
    }

    return v[ i_mn ];
}

function busca() {
    while ( !check_attrib( atribuicao ) ) {
        atribuicao = proxima( atribuicao );
        console.log( atrib_eval( atribuicao ) );
    }
}
