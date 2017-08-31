precision mediump float;
// precision highp float;

uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;

void main_a(void)
{
	vec2	vTex =  v_TexCoord;
	vec4 	vFragColour;
	int		filterNumber = 5;

	vec2	tcOffset[25] ;
	tcOffset[0] = vec2(-2.,-2.);
	tcOffset[1] = vec2(-1.,-2.);
	tcOffset[2] = vec2(0.,-2.);
	tcOffset[3] = vec2(1.,-2.);
	tcOffset[4] = vec2(2.,-2.);

	tcOffset[5] = vec2(-2.,-1.);
	tcOffset[6] = vec2(-1.,-1.);
	tcOffset[7] = vec2(0.,-1.);
	tcOffset[8] = vec2(1.,-1.);
	tcOffset[9] = vec2(2.,-1.);

	tcOffset[10] = vec2(-2.,0.);
	tcOffset[11] = vec2(-1.,0.);
	tcOffset[12] = vec2(0.,0.);
	tcOffset[13] = vec2(1.,0.);
	tcOffset[14] = vec2(2.,0.);

	tcOffset[15] = vec2(-2.,1.);
	tcOffset[16] = vec2(-1.,1.);
	tcOffset[17] = vec2(0.,1.);
	tcOffset[18] = vec2(1.,1.);
	tcOffset[19] = vec2(2.,1.);

	tcOffset[20] = vec2(-2.,2.);
	tcOffset[21] = vec2(-1.,2.);
	tcOffset[22] = vec2(0.,2.);
	tcOffset[23] = vec2(1.,2.);
	tcOffset[24] = vec2(2.,2.);

	// Standard
	if (filterNumber == 0)
	{
		vFragColour = texture2D(u_Sampler, vTex);
	}

	// Greyscale
	if (filterNumber == 1)
	{
		// Convert to greyscale using NTSC weightings
		float grey = dot(texture2D(u_Sampler, vTex).rgb, vec3(0.299, 0.587, 0.114));

		vFragColour = vec4(grey, grey, grey, 1.0);
	}

	// Sepia tone
	if (filterNumber == 2)
	{
		// Convert to greyscale using NTSC weightings
		float grey = dot(texture2D(u_Sampler, vTex).rgb, vec3(0.299, 0.587, 0.114));

		// Play with these rgb weightings to get different tones.
		// (As long as all rgb weightings add up to 1.0 you won't lighten or darken the image)
		vFragColour = vec4(grey * vec3(1.2, 1.0, 0.8), 1.0);
	}

	// Negative
	if (filterNumber == 3)
	{
		vec4 texMapColour = texture2D(u_Sampler, vTex);

		vFragColour = vec4(1.0 - texMapColour.rgb, 1.0);
	}

	float prec = 1./(1024.*1024.);
	// Blur (gaussian)
	if (filterNumber == 4)
	{
		vec4 sample[25];

		for (int i = 0; i < 25; i++)
		{
			// Sample a grid around and including our texel
			sample[i] = texture2D(u_Sampler, vTex + tcOffset[i] * prec );
		}

		// Gaussian weighting:
		// 1  4  7  4 1
		// 4 16 26 16 4
		// 7 26 41 26 7 / 273 (i.e. divide by total of weightings)
		// 4 16 26 16 4
		// 1  4  7  4 1

    		vFragColour = (
        	           (1.0  * (sample[0] + sample[4]  + sample[20] + sample[24])) +
	                   (4.0  * (sample[1] + sample[3]  + sample[5]  + sample[9] + sample[15] + sample[19] + sample[21] + sample[23])) +
	                   (7.0  * (sample[2] + sample[10] + sample[14] + sample[22])) +
	                   (16.0 * (sample[6] + sample[8]  + sample[16] + sample[18])) +
	                   (26.0 * (sample[7] + sample[11] + sample[13] + sample[17])) +
	                   (41.0 * sample[12])
	                   ) / 273.0;

	}

	// Blur (median filter)
	if (filterNumber == 5)
	{
		vFragColour = vec4(0.0);

		for (int i = 0; i < 25; i++)
		{
			// Sample a grid around and including our texel
			vFragColour += texture2D(u_Sampler, vTex + tcOffset[i] * prec );
		}

		vFragColour /= 25.;
	}

	// Sharpen
	if (filterNumber == 6)
	{
		vec4 sample[25];

		for (int i = 0; i < 25; i++)
		{
			// Sample a grid around and including our texel
			sample[i] = texture2D(u_Sampler, vTex + tcOffset[i] * prec );
		}

		// Sharpen weighting:
		// -1 -1 -1 -1 -1
		// -1 -1 -1 -1 -1
		// -1 -1 25 -1 -1
		// -1 -1 -1 -1 -1
		// -1 -1 -1 -1 -1

    		vFragColour = 25.0 * sample[12];

		for (int i = 0; i < 25; i++)
		{
			if (i != 12)
				vFragColour -= sample[i];
		}
	}

	// Dilate
	if (filterNumber == 7)
	{
		vec4 sample[25];
		vec4 maxValue = vec4(0.0);

		for (int i = 0; i < 25; i++)
		{
			// Sample a grid around and including our texel
			sample[i] = texture2D(u_Sampler, vTex + tcOffset[i] * prec );

			// Keep the maximum value
			maxValue = max(sample[i], maxValue);
		}

		vFragColour = maxValue;
	}

	// Erode
	if (filterNumber == 8)
	{
		vec4 sample[25];
		vec4 minValue = vec4(1.0);

		for (int i = 0; i < 25; i++)
		{
			// Sample a grid around and including our texel
			sample[i] = texture2D(u_Sampler, vTex + tcOffset[i] * prec );

			// Keep the minimum value
			minValue = min(sample[i], minValue);
		}

		vFragColour = minValue;
	}

	// Laplacian Edge Detection (very, very similar to sharpen filter - check it out!)
	if (filterNumber == 9)
	{
		vec4 sample[25];

		for (int i = 0; i < 25; i++)
		{
			// Sample a grid around and including our texel
			sample[i] = texture2D(u_Sampler, vTex + tcOffset[i] * prec );
		}

		// Laplacian weighting:
		// -1 -1 -1 -1 -1
		// -1 -1 -1 -1 -1
		// -1 -1 24 -1 -1
		// -1 -1 -1 -1 -1
		// -1 -1 -1 -1 -1

    		vFragColour = 24.0 * sample[12];

		for (int i = 0; i < 25; i++)
		{
			if (i != 12)
				vFragColour -= sample[i];
		}
	}

	gl_FragColor = vFragColour;
}

#define tex2D texture2D

vec2 fixed2(float x,float y)
{
	return vec2(x,y);
}

vec3 fixed3(float a,float b,float c)
{
	return vec3(a,b,c);
}

vec4 fixed4(float a,float b,float c,float d)
{
	return vec4(a,b,c,d);
}

//获取像素点
vec4 Pixel(sampler2D tex, vec2 coord,vec2 pos)
{
	vec4 s = texture2D(tex, coord + pos);
	return s;
}

//获取像素点
vec4 BasePixel()
{
	return texture2D(u_Sampler, v_TexCoord);
}

//获取像素点值
vec4 SPixel(vec2 pos)
{
	float spacing = 1.0/3000.;
	return Pixel(u_Sampler,v_TexCoord,pos * spacing);
}

//均值9过滤
vec4 Mean9Filter (sampler2D tex, vec2 coord)
{
    vec4 s1 = SPixel(vec2(1.,0.));
    vec4 s2 = SPixel(vec2(-1.,0.));
    vec4 s3 = SPixel(vec2(0.,1.));
    vec4 s4 = SPixel(vec2(0.,-1.));
    vec4 texCol = BasePixel();
    float pct = 0.2;
    vec4 outp = texCol * pct + s1* pct + s2* pct+ s3* pct + s4* pct;
    return outp;
}

//均值25过滤
vec4 Mean25Filter(sampler2D tex, vec2 coord)
{
	vec2 offset[9];
	offset[0] = vec2(-1,-1);
	offset[1] = vec2(0,-1);
	offset[2] = vec2(1,-1);

	offset[3] = vec2(-1,0);
	offset[4] = vec2(0.,0.);
	offset[5] = vec2(1,-1);

	offset[6] = vec2(-1,1);
	offset[7] = vec2(0,1);
	offset[8] = vec2(1,1);

	vec4 sv[9];
	sv[0] = SPixel(offset[0]);
	sv[1] = SPixel(offset[1]);
	sv[2] = SPixel(offset[2]);
	sv[3] = SPixel(offset[3]);
	sv[4] = SPixel(offset[4]);
	sv[5] = SPixel(offset[5]);
	sv[6] = SPixel(offset[6]);
	sv[7] = SPixel(offset[7]);
	sv[8] = SPixel(offset[8]);

    vec4 texCol = BasePixel();
	float dis = 0.85;
    float pct = (1. - dis)/25.;
    vec4 outp = texCol * dis;
	for (int i = 0; i < 9 ; i++)
	{
		outp += sv[i]*pct;
	}
    return outp;
}

//亮度
float luminance(vec3 color)
{
	return dot(fixed3( 0.2125 , 0.7154 , 0.0721 ) , color);
}

//高斯滤波
vec4 GaussianFilter(sampler2D tex, vec2 coord)
{
	float ft[25];
	ft[0] = 1.;
	ft[1] = 4.;
	ft[2] = 7.;
	ft[3] = 4.;
	ft[4] = 1.;

	ft[5] = 4.;
	ft[6] = 16.;
	ft[7] = 26.;
	ft[8] = 16.;
	ft[9] = 4.;

	ft[10] = 7.;
	ft[11] = 26.;
	ft[12] = 41.;
	ft[13] = 26.;
	ft[14] = 7.;

	ft[15] = 4.;
	ft[16] = 16.;
	ft[17] = 26.;
	ft[18] = 16.;
	ft[19] = 4.;

	ft[20] = 1.;
	ft[21] = 4.;
	ft[22] = 7.;
	ft[23] = 4.;
	ft[24] = 1.;

	vec4 color = vec4(0.);
	for (int i = 0; i < 5; i++)
	{
		for (int j = 0; j < 5;j++)
		{
			color += SPixel(vec2(float(i) - 3., float(j) - 3.)) * ft[i*5+j];
		}
	}
	return  color;
}

//均值过滤
vec4 sharpenFilter(sampler2D tex, vec2 coord)
{
	float offset = 1./5000.;
	vec2 texSize = vec2(1.,1.);

	float pos[9];
	pos[0] = -1.;
	pos[1] = -1.;
	pos[2] = -1.;
	pos[3] = -1.;
	pos[4] = 9.;
	pos[5] = -1.;
	pos[6] = -1.;
	pos[7] = -1.;
	pos[8] = -1.;

	vec4 outCol = vec4(0.,0.,0.,0.);
	for (int i = 0; i < 3; i++)
	{
		for (int j = 0; j < 3; j++)
		{
			//计算采样点，得到当前像素附近的像素的坐标
			vec2 newCoord = vec2(coord.x + (float(i)-1.)*offset, coord.y + (float(j)-1.)*offset);
			vec2 newUV = vec2(newCoord.x / texSize.x, newCoord.y / texSize.y);
			//采样并乘以滤波器权重，然后累加
			outCol += tex2D(tex, newUV) * pos[i*3 + j];
		}
	}
	return outCol;
}

//设置数值
void SetValue(out vec4 sort[9],int index,vec4 value)
{
	if(index == 0)
	{
		sort[0] = value;
	}
	else if(index == 1)
	{
		sort[1] = value;
	}
	else if(index == 2)
	{
		sort[2] = value;
	}
	else if(index == 3)
	{
		sort[3] = value;
	}
	else if(index == 4)
	{
		sort[4] = value;
	}
	else if(index == 5)
	{
		sort[5] = value;
	}
	else if(index == 6)
	{
		sort[6] = value;
	}
	else if(index == 7)
	{
		sort[7] = value;
	}
	else if(index == 8)
	{
		sort[8] = value;
	}
}

//RGB转浮点
float GetRGB(vec4 value)
{
	return value.r*255.*255. + value.g*255. + value.b;
}

//浮点转RGB
vec4 GetRGBVec(float value)
{
	vec4 ret = vec4(1.);
	ret.r = value/(255.*255.);
	ret.g = (value - ret.r * (255.*255.))/255.;
	ret.b = (value - ret.r * (255.*255.) - ret.g * 255.);
	return ret;
}

//亮度
float GetLLuminance(vec4 color)
{
	return dot(fixed3( 0.2125 , 0.7154 , 0.0721 ) , color.rgb);
}

//灰度
float GetGray(vec4 color)
{
	//  return  (color.r*299. + color.g*587. + color.b*114. + 500.) / 1000.;
	 return (color.r*0.299 + color.g*0.587 + color.b*0.114);
}

//插入排序
int InsetSort(out vec4 sort[9],int count,vec4 value)
{
	if(count >= 8) return count;
	int index = -1;
	for(int a = 0;a < 9; a++){
		if(a >= count) break;
		if(GetGray(value) < GetGray(sort[a]))
		{
			index = a;
			break;
		}
	}
	if(index != -1)
	{
		for(int a = 9; a > 0 ;a--)
		{
			if(a > count) continue;
			if (a <= index) break;
			sort[a] = sort[a - 1];
		}
		SetValue(sort,index,value);
		// sort[index] = value;
	}
	else
	{
		SetValue(sort,count,value);
		// sort[count] = value;
	}
	return (count + 1);
}

//中值过滤
vec4 medianFilter(sampler2D tex, vec2 coord)
{
	vec4 colors [9];
	int  count = 0;
	for (int j = 0; j < 3; j++)
	{
		for (int i = 0; i < 3; i++)
		{
			vec4 color = SPixel(vec2(float(i) - 1., float(j) - 1.));
			if(count == 0)
			{
				colors[0] = color;
				count++;
			}else{
				count = InsetSort(colors,count,color);
			}
		}
	}
	return colors[4];
}

//对称邻近均值滤波
vec4 snnFilter(sampler2D tex, vec2 coord)
{
	vec4 colors [9];
	float temp1[9];
	for (int j = 0; j < 3; j++)
	{
		for (int i = 0; i < 3; i++)
		{
			vec4 color = SPixel(vec2(float(i) - 1., float(j) - 1.));
			colors[j*3 + i] = color;
			temp1[j*3 + i] = GetGray(color);
		}
	}
	vec4 sum = vec4(0.);
	for(int k=0; k< 4; k++)
	{
		float i1 = abs(temp1[4] - temp1[k]);
		float i2 = abs(temp1[4] - temp1[9-k-1]);
		sum += i1<i2 ? colors[k] : colors[9-k-1];
	}
	vec4 color = sum/4.;
	color.a = 1.;
	return color;
}

//边界检查计算
vec2 sobelCalculation(float mc[9])
{
	float gx[ 9 ];
	gx[0] = -1.;
	gx[1] = 0.;
	gx[2] = 1.;
	gx[3] = -2.;
	gx[4] = 0.;
	gx[5] = 2.;
	gx[6] = -1.;
	gx[7] = 0.;
	gx[8] = 1.;

	float gy[ 9 ];
	gy[0] = -1.;
	gy[1] = -2.;
	gy[2] = -1.;
	gy[3] = 0.;
	gy[4] = 0.;
	gy[5] = 0.;
	gy[6] = 1.;
	gy[7] = 2.;
	gy[8] = 1.;

	float GX = 0.;
	for (int i = 0 ; i < 9 ; i++)
	{
		GX += mc[i]*gx[i];
	}
	float GY = 0.;
	for (int i = 0 ; i < 9 ; i++)
	{
		GY += mc[i]*gy[i];
	}
	return vec2(GX,GY);
}

//边界检查过滤
vec4 sobelFilter(sampler2D sampler,vec2 uv)
{
	float mcArray[9];
	mcArray[0]= luminance(SPixel(vec2(-1.,1.)).rgb);
	mcArray[1] = luminance(SPixel(vec2(0.,1.)).rgb);
	mcArray[2] = luminance(SPixel(vec2(1.,1.)).rgb);
	mcArray[3] = luminance(SPixel(vec2(-1.,0.)).rgb);
	mcArray[4] = luminance(SPixel(vec2(0.,0.)).rgb);
	mcArray[5] = luminance(SPixel(vec2(1.,0.)).rgb);
	mcArray[6]= luminance(SPixel(vec2(-1.,-1.)).rgb);
	mcArray[7] = luminance(SPixel(vec2(0.,-1.)).rgb);
	mcArray[8]= luminance(SPixel(vec2(1.,-1.)).rgb);

	vec2 so = sobelCalculation(mcArray);
	vec4 c = vec4(so,0.,1.);
	float len =  length(so);
	c = vec4(len,len,len,1.0);
	// return c;
	vec2 texSize = vec2(1.,1.);
	if( len > 0.5)
	{
		// return sharpenFilter(sampler,uv);
		// return medianFilter(sampler,uv);
		return snnFilter(sampler,uv);
		// return vec4(1.,0.,0.,1.);
	}
	return BasePixel();
}

//边界检查
vec4 sobel(sampler2D sampler,vec2 uv)
{
	float _Size = 1000.;

	float mc00 = luminance(tex2D (sampler, uv-fixed2(-1.,1.)/_Size).rgb);
	float mc01 = luminance(tex2D (sampler, uv-fixed2(0.,1.)/_Size).rgb);
	float mc02 = luminance(tex2D (sampler, uv-fixed2(1.,1.)/_Size).rgb);
	float mc10 = luminance(tex2D (sampler, uv-fixed2(-1.,0.)/_Size).rgb);
	float mc11 = luminance(tex2D (sampler, uv-fixed2(0.,0.)/_Size).rgb);
	float mc12 = luminance(tex2D (sampler, uv-fixed2(1.,0.)/_Size).rgb);
	float mc20 = luminance(tex2D (sampler, uv-fixed2(-1.,-1.)/_Size).rgb);
	float mc21 = luminance(tex2D (sampler, uv-fixed2(0.,-1.)/_Size).rgb);
	float mc22 = luminance(tex2D (sampler, uv-fixed2(1.,-1.)/_Size).rgb);

	float GX = -1. * mc00 + mc20 + -2. * mc01 + 2. * mc21 - mc02 + mc22;
	float GY = mc00 + 2. * mc10 + mc20 - mc02 - 2. * mc12 - mc22;

	float len = length(vec2(GX,GY));
	vec4 c = vec4(len,len,len,1.0);
	return  c;
}

//边界检查
vec4 sobel2(sampler2D _MainTex, vec2 uv_MainTex)
{
	float _Size = 1000.;
	//获取当前点的周围的点
	//并与luminance点积，求出亮度值（黑白图）
	float mc00 = luminance(tex2D (_MainTex, uv_MainTex-fixed2(1.,1.)/_Size).rgb);
	float mc10 = luminance(tex2D (_MainTex, uv_MainTex-fixed2(0.,1.)/_Size).rgb);
	float mc20 = luminance(tex2D (_MainTex, uv_MainTex-fixed2(-1.,1.)/_Size).rgb);
	float mc01 = luminance(tex2D (_MainTex, uv_MainTex-fixed2(1.,0.)/_Size).rgb);
	float mc11 = luminance(tex2D (_MainTex, uv_MainTex).rgb);
	float mc21 = luminance(tex2D (_MainTex, uv_MainTex-fixed2(-1.,0.)/_Size).rgb);
	float mc02 = luminance(tex2D (_MainTex, uv_MainTex-fixed2(1.,-1.)/_Size).rgb);
	float mc12 = luminance(tex2D (_MainTex, uv_MainTex-fixed2(0.,-1.)/_Size).rgb);
	float mc22 = luminance(tex2D (_MainTex, uv_MainTex-fixed2(-1.,-1.)/_Size).rgb);

	//根据过滤器矩阵求出GX水平和GY垂直的灰度值
	float GX = -1. * mc00 + mc20 + -2. * mc01 + 2. * mc21 - mc02 + mc22;
	float GY = mc00 + 2. * mc10 + mc20 - mc02 - 2. * mc12 - mc22;
	//  float G = sqrt(GX*GX+GY*GY);//标准灰度公式
	float G = abs(GX)+abs(GY);//近似灰度公式
	//          float th = atan(GY/GX);//灰度方向
	vec4 c = vec4(0.);
	//          c = G>th?1:0;
	//          c = G/th*2;
	float len =  length(vec2(GX,GY));
	c = vec4(len,len,len,1.0);//length的内部算法就是灰度公式的算法，欧几里得长度

	return c;
}

void main()
{
	// main_a();
	// vec2 iResolution = vec2(200.,200.);
	// gl_FragColor = BasePixel();
	// gl_FragColor = Mean9Filter(u_Sampler,v_TexCoord);
	// gl_FragColor = Mean25Filter(u_Sampler,v_TexCoord);
	// gl_FragColor = sobel(u_Sampler,v_TexCoord);
	// gl_FragColor = sobel2(u_Sampler,v_TexCoord);
	// gl_FragColor = sobelFilter(u_Sampler,v_TexCoord);
	gl_FragColor = snnFilter(u_Sampler,v_TexCoord);
}
