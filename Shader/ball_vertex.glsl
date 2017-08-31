attribute vec4 avertexPosition;
uniform mat4 mvpMatrix;
attribute vec2 aTexCoord;
varying vec2 v_TexCoord;
void main(){
	gl_Position = mvpMatrix * avertexPosition;
	v_TexCoord = aTexCoord;
}
